'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { supabaseRealtime } from '@/lib/supabase-realtime'

// Types for WebSocket messages
interface WSMessage {
  type: string
  data?: any
  timestamp?: number
  error?: string
}

interface AdminCommand {
  type: 
    | 'admin:broadcast'
    | 'admin:ban_user' 
    | 'admin:refresh_analytics'
    | 'admin:announce'
    | 'admin:force_reload'
    | 'admin:read_only'
  data?: any
}

interface BanUserData {
  userId: string
  reason?: string
}

interface BroadcastData {
  message: string
}

interface UseAdminWSOptions {
  autoConnect?: boolean
  reconnectAttempts?: number
  reconnectDelay?: number
}

interface UseAdminWSReturn {
  // Connection state
  isConnected: boolean
  isConnecting: boolean
  connectionError: string | null
  
  // Recent messages
  messages: WSMessage[]
  
  // Admin commands
  broadcast: (message: string) => Promise<boolean>
  banUser: (userId: string, reason?: string) => Promise<boolean>
  refreshAnalytics: () => Promise<boolean>
  
  // New simple controls
  announce: (title: string, body: string, ttlSec?: number) => Promise<boolean>
  forceReload: (reason?: string) => Promise<boolean>
  setReadOnly: (enabled: boolean, reason?: string) => Promise<boolean>
  
  // Connection management
  connect: () => void
  disconnect: () => void
  
  // Message listening
  onMessage: (callback: (message: WSMessage) => void) => () => void
}

export function useAdminWS(options: UseAdminWSOptions = {}): UseAdminWSReturn {
  const {
    autoConnect = true,
    reconnectAttempts = 3,
    reconnectDelay = 2000
  } = options

  const { userId } = useAuth()
  const channelRef = useRef<ReturnType<typeof supabaseRealtime.channel> | null>(null)
  const messageListenersRef = useRef<Set<(message: WSMessage) => void>>(new Set())

  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [messages, setMessages] = useState<WSMessage[]>([])

  // Add message to history
  const addMessage = useCallback((message: WSMessage) => {
    setMessages(prev => [...prev.slice(-49), message]) // Keep last 50 messages
    
    // Notify listeners
    messageListenersRef.current.forEach(listener => {
      try {
        listener(message)
      } catch (error) {
        console.error('Error in WebSocket message listener:', error)
      }
    })
  }, [])

  // Send command via Supabase Realtime
  const sendCommand = useCallback(async (command: AdminCommand): Promise<boolean> => {
    if (!channelRef.current) {
      console.error('Supabase channel not connected')
      setConnectionError('Not connected')
      return false
    }

    try {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'admin',
        payload: {
          type: command.type,
          data: command.data,
          timestamp: Date.now()
        }
      })
      console.log('📤 Sent admin command via Supabase:', command.type)
      return true
    } catch (error) {
      console.error('Failed to send command:', error)
      setConnectionError('Failed to send')
      return false
    }
  }, [])

  // Admin command functions
  const broadcast = useCallback((message: string) => 
    sendCommand({ type: 'admin:broadcast', data: { message } }), [sendCommand])

  const banUser = useCallback(async (userId: string, reason = 'Policy violation') => {
    try {
      const token = localStorage.getItem('admin_token')
      const res = await fetch('/api/admin/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ userId, reason })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ban failed')

      addMessage({ type: 'ban_executed', data: { targetUserId: userId, reason, success: true }, timestamp: Date.now() })
      return true
    } catch (e: any) {
      addMessage({ type: 'ban_executed', error: e.message || 'Ban failed', timestamp: Date.now() })
      return false
    }
  }, [addMessage])

  const refreshAnalytics = useCallback(() => 
    sendCommand({ type: 'admin:refresh_analytics' }), [sendCommand])

  // New simple controls
  const announce = useCallback(
    (title: string, body: string, ttlSec = 60) =>
      sendCommand({ type: 'admin:announce', data: { title, body, ttlSec } }),
    [sendCommand]
  )

  const forceReload = useCallback(
    (reason = 'Admin-triggered update') =>
      sendCommand({ type: 'admin:force_reload', data: { reason } }),
    [sendCommand]
  )

  const setReadOnly = useCallback(
    (enabled: boolean, reason?: string) =>
      sendCommand({ type: 'admin:read_only', data: { enabled, reason } }),
    [sendCommand]
  )

  // Connect to Supabase Realtime channel
  const connect = useCallback(() => {
    if (channelRef.current) {
      console.log('⏭️ Already connected, skipping')
      return
    }

    setIsConnecting(true)
    setConnectionError(null)

    console.log('🔌 Connecting to Supabase Realtime admin channel...')
    console.log('📍 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('📍 Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const error = 'Missing Supabase environment variables'
      console.error('❌', error)
      setConnectionError(error)
      setIsConnecting(false)
      return
    }

    const ch = supabaseRealtime.channel('admin_commands', {
      config: { broadcast: { self: true } }
    })

    console.log('📡 Channel created, setting up listeners...')

    // Listen for admin broadcasts
    ch.on('broadcast', { event: 'admin' }, (payload) => {
      const msg: WSMessage = payload.payload
      console.log('📥 Supabase broadcast message:', msg)
      
      addMessage(msg)

      // Handle specific message types
      switch (msg.type) {
        case 'admin:broadcast':
          console.log('📢 Admin broadcast received:', msg.data)
          break
        case 'ban_executed':
          console.log('🔨 Ban executed:', msg.data)
          break
        case 'analytics_refresh':
          console.log('📊 Analytics refresh triggered:', msg.data)
          break
        case 'announce:ack':
          console.log('� Announcement acknowledged:', msg.data)
          break
        case 'client:reloading':
          console.log('♻️ Client acknowledged reload:', msg.data)
          break
        case 'read_only:applied':
          console.log('� Read-only applied:', msg.data)
          break
      }
    })

    // Subscribe to channel
    ch.subscribe((status) => {
      console.log('� Supabase channel status:', status)
      
      if (status === 'SUBSCRIBED') {
        setIsConnecting(false)
        setIsConnected(true)
        addMessage({ 
          type: 'auth:success', 
          data: { message: 'Supabase Realtime channel connected' }, 
          timestamp: Date.now() 
        })
        console.log('🎉 Successfully subscribed to admin channel')
      } else if (status === 'CHANNEL_ERROR') {
        setIsConnecting(false)
        setIsConnected(false)
        setConnectionError('Failed to connect to Supabase Realtime')
      } else if (status === 'TIMED_OUT') {
        setIsConnecting(false)
        setIsConnected(false)
        setConnectionError('Connection timeout')
      }
    })

    channelRef.current = ch
  }, [addMessage])

  // Disconnect from Supabase Realtime
  const disconnect = useCallback(() => {
    if (channelRef.current) {
      console.log('🔌 Disconnecting from Supabase Realtime...')
      channelRef.current.unsubscribe()
      channelRef.current = null
    }
    
    setIsConnected(false)
    setIsConnecting(false)
  }, [])

  // Message listener management
  const onMessage = useCallback((callback: (message: WSMessage) => void) => {
    messageListenersRef.current.add(callback)
    
    return () => {
      messageListenersRef.current.delete(callback)
    }
  }, [])

  // Auto-connect effect
  useEffect(() => {
    if (autoConnect) {
      console.log('🔌 Supabase Realtime auto-connect enabled')
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, connect, disconnect])

  return {
    isConnected,
    isConnecting,
    connectionError,
    messages,
    broadcast,
    banUser,
    refreshAnalytics,
    
    // New simple controls
    announce,
    forceReload,
    setReadOnly,
    
    connect,
    disconnect,
    onMessage
  }
}