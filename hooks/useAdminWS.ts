'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'

// Types for WebSocket messages
interface WSMessage {
  type: string
  data?: any
  timestamp?: number
  error?: string
}

interface AdminCommand {
  type: 'admin:broadcast' | 'admin:ban_user' | 'admin:refresh_analytics'
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

  const { getToken, userId } = useAuth()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectCountRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
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

  // Send command to WebSocket
  const sendCommand = useCallback(async (command: AdminCommand): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.error('WebSocket not connected')
        resolve(false)
        return
      }

      try {
        wsRef.current.send(JSON.stringify(command))
        console.log('📤 Sent admin command:', command.type)
        resolve(true)
      } catch (error) {
        console.error('Failed to send command:', error)
        resolve(false)
      }
    })
  }, [])

  // Admin command functions
  const broadcast = useCallback((message: string) => 
    sendCommand({ type: 'admin:broadcast', data: { message } }), [sendCommand])

  const banUser = useCallback((userId: string, reason = 'Policy violation') => 
    sendCommand({ type: 'admin:ban_user', data: { userId, reason } }), [sendCommand])

  const refreshAnalytics = useCallback(() => 
    sendCommand({ type: 'admin:refresh_analytics' }), [sendCommand])

  // Create WebSocket connection
  const createConnection = useCallback(async () => {
    if (isConnecting || isConnected) return
    if (!userId) {
      console.log('⏳ Waiting for user authentication...')
      return
    }

    setIsConnecting(true)
    setConnectionError(null)

    try {
      // Get auth token
      const token = await getToken()
      if (!token) {
        throw new Error('Failed to get authentication token')
      }

      // Create WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/api/ws`
      
      console.log('🔌 Connecting to WebSocket:', wsUrl)
      console.log('📍 Environment:', process.env.NODE_ENV)
      
      // Check if we're in development
      const isDev = process.env.NODE_ENV === 'development'
      if (isDev) {
        console.log('⚠️ Development mode: WebSocket may not work with Next.js dev server')
      }
      
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      // Connection opened
      ws.onopen = () => {
        console.log('✅ WebSocket connected, authenticating...')
        
        // Send authentication
        ws.send(JSON.stringify({ 
          type: 'auth', 
          token: `admin.${token}` // Add admin prefix for now - replace with proper admin check
        }))
      }

      // Handle messages
      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data)
          console.log('📥 WebSocket message:', message)
          
          addMessage(message)

          // Handle specific message types
          switch (message.type) {
            case 'auth:success':
              setIsConnected(true)
              setIsConnecting(false)
              reconnectCountRef.current = 0
              console.log('🎉 WebSocket authenticated successfully')
              break

            case 'auth:error':
              setConnectionError(message.error || 'Authentication failed')
              setIsConnecting(false)
              ws.close()
              break

            case 'broadcast':
              console.log('📢 Admin broadcast received:', message.data)
              break

            case 'ban_executed':
              console.log('🔨 Ban executed:', message.data)
              break

            case 'analytics_refresh':
              console.log('📊 Analytics refresh triggered:', message.data)
              break
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      // Connection closed
      ws.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code, event.reason)
        setIsConnected(false)
        setIsConnecting(false)
        wsRef.current = null

        // Attempt reconnection if not a clean close
        if (event.code !== 1000 && reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current++
          console.log(`🔄 Reconnecting... (${reconnectCountRef.current}/${reconnectAttempts})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            createConnection()
          }, reconnectDelay * reconnectCountRef.current)
        }
      }

      // Connection error
      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        
        const isDev = process.env.NODE_ENV === 'development'
        const errorMsg = isDev 
          ? 'WebSocket failed: Next.js dev server may not support WebSocket. Try production build or use ngrok.'
          : 'WebSocket connection failed'
          
        setConnectionError(errorMsg)
        setIsConnecting(false)
      }

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      setConnectionError(error instanceof Error ? error.message : 'Connection failed')
      setIsConnecting(false)
    }
  }, [userId, getToken, isConnecting, isConnected, reconnectAttempts, reconnectDelay, addMessage])

  // Connect function
  const connect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    reconnectCountRef.current = 0
    createConnection()
  }, [createConnection])

  // Disconnect function
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect')
      wsRef.current = null
    }
    
    setIsConnected(false)
    setIsConnecting(false)
    reconnectCountRef.current = 0
  }, [])

  // Message listener management
  const onMessage = useCallback((callback: (message: WSMessage) => void) => {
    messageListenersRef.current.add(callback)
    
    return () => {
      messageListenersRef.current.delete(callback)
    }
  }, [])

  // Auto-connect effect (disabled in development)
  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development'
    
    if (autoConnect && userId && !isDev) {
      console.log('🔌 WebSocket auto-connect enabled for production')
      connect()
    } else if (isDev) {
      console.log('⚠️ WebSocket disabled in development mode')
      setConnectionError('WebSocket disabled in development - Supabase Realtime active')
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, userId]) // Only re-run when userId changes

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [])

  return {
    isConnected,
    isConnecting,
    connectionError,
    messages,
    broadcast,
    banUser,
    refreshAnalytics,
    connect,
    disconnect,
    onMessage
  }
}