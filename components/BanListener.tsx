'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { createUserStatusSubscription } from '@/lib/supabase-realtime'

// Types
interface BanNotification {
  reason: string
  bannedBy: string
  timestamp: number
}

interface UseBanListenerOptions {
  enableWebSocket?: boolean
  enableSupabaseRealtime?: boolean
  onBanReceived?: (data: BanNotification) => void
}

interface UseBanListenerReturn {
  isBanned: boolean
  isListening: boolean
  banReason: string | null
}

/**
 * Hook that listens for ban events from both WebSocket and Supabase Realtime
 * Automatically signs out user and redirects to ban page when banned
 */
export function useBanListener(options: UseBanListenerOptions = {}): UseBanListenerReturn {
  const {
    enableWebSocket = true,
    enableSupabaseRealtime = true,
    onBanReceived
  } = options

  const { userId, signOut } = useAuth()
  const router = useRouter()
  
  const [isBanned, setIsBanned] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [banReason, setBanReason] = useState<string | null>(null)
  
  const wsRef = useRef<WebSocket | null>(null)
  const supabaseSubscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)
  const processedBansRef = useRef<Set<string>>(new Set())

  // Handle ban received
  const handleBanReceived = async (data: BanNotification) => {
    console.log('🚫 Ban notification received:', data)
    
    // Prevent duplicate processing
    const banId = `${data.timestamp}-${data.reason}`
    if (processedBansRef.current.has(banId)) {
      return
    }
    processedBansRef.current.add(banId)

    setIsBanned(true)
    setBanReason(data.reason)
    
    // Call custom handler
    onBanReceived?.(data)

    try {
      // Sign out user
      console.log('🔓 Signing out banned user...')
      await signOut()
      
      // Redirect to ban page
      console.log('➡️ Redirecting to ban page...')
      router.replace('/banned')
    } catch (error) {
      console.error('Error handling ban:', error)
      // Force redirect even if signOut fails
      window.location.href = '/banned'
    }
  }

  // Setup WebSocket listener
  useEffect(() => {
    if (!enableWebSocket || !userId) return

    const connectWebSocket = async () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const wsUrl = `${protocol}//${window.location.host}/api/ws`
        
        console.log('🔌 Connecting to ban WebSocket:', wsUrl)
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
          console.log('✅ Ban WebSocket connected, authenticating...')
          // Send auth for regular user
          ws.send(JSON.stringify({ 
            type: 'auth', 
            token: userId // Simple token for now
          }))
        }

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            
            if (message.type === 'ban_executed' && message.data) {
              handleBanReceived({
                reason: message.data.reason || 'Policy violation',
                bannedBy: message.data.bannedBy || 'Admin',
                timestamp: message.data.timestamp || Date.now()
              })
            }
          } catch (error) {
            console.error('Error parsing ban WebSocket message:', error)
          }
        }

        ws.onclose = () => {
          console.log('🔌 Ban WebSocket closed')
          wsRef.current = null
        }

        ws.onerror = (error) => {
          console.error('❌ Ban WebSocket error:', error)
        }

      } catch (error) {
        console.error('Failed to setup ban WebSocket:', error)
      }
    }

    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [enableWebSocket, userId])

  // Setup Supabase Realtime listener
  useEffect(() => {
    if (!enableSupabaseRealtime || !userId) return

    console.log('📡 Setting up Supabase ban listener for user:', userId)
    
    const subscription = createUserStatusSubscription(userId, (event) => {
      console.log('📡 User status event:', event)
      
      // Check if user was banned
      if (event.eventType === 'INSERT' || event.eventType === 'UPDATE') {
        const newStatus = event.new
        if (newStatus?.status === 'banned') {
          handleBanReceived({
            reason: newStatus.ban_reason || 'Account suspended',
            bannedBy: newStatus.banned_by || 'System',
            timestamp: new Date(newStatus.updated_at).getTime()
          })
        }
      }
    })

    supabaseSubscriptionRef.current = subscription
    setIsListening(true)

    return () => {
      if (supabaseSubscriptionRef.current) {
        console.log('🔌 Cleaning up Supabase ban listener')
        supabaseSubscriptionRef.current.unsubscribe()
        supabaseSubscriptionRef.current = null
      }
      setIsListening(false)
    }
  }, [enableSupabaseRealtime, userId])

  return {
    isBanned,
    isListening,
    banReason
  }
}

/**
 * Component that automatically listens for ban events
 * Place this in your authenticated layout
 */
export function BanListener(props: UseBanListenerOptions = {}) {
  useBanListener(props)
  return null // This component doesn't render anything
}

/**
 * Component with visual indicator for ban listening status
 * Useful for debugging in development
 */
export function BanListenerDebug() {
  const { isBanned, isListening, banReason } = useBanListener()

  if (!isListening && !isBanned) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {isListening && !isBanned && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-xs">
          🟢 Ban listener active
        </div>
      )}
      
      {isBanned && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-xs">
          🚫 Account banned: {banReason}
        </div>
      )}
    </div>
  )
}