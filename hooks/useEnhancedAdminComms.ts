'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRealtime } from '@/components/RealtimeProvider'

// Enhanced admin hook with polling for commands
export function useEnhancedAdminComms() {
  const { liveStats, isConnected } = useRealtime()
  const [adminMessages, setAdminMessages] = useState<any[]>([])

  // Polling for admin commands (every 2 seconds)
  const pollAdminCommands = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/commands/poll')
      if (response.ok) {
        const commands = await response.json()
        if (commands.length > 0) {
          setAdminMessages(prev => [...prev, ...commands])
        }
      }
    } catch (error) {
      console.error('Polling error:', error)
    }
  }, [])

  // Start polling
  useEffect(() => {
    const interval = setInterval(pollAdminCommands, 2000)
    return () => clearInterval(interval)
  }, [pollAdminCommands])

  // Send admin command
  const sendAdminCommand = useCallback(async (command: string, data: any) => {
    try {
      const response = await fetch('/api/admin/commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, data, timestamp: Date.now() })
      })
      return response.ok
    } catch (error) {
      console.error('Command error:', error)
      return false
    }
  }, [])

  return {
    // Real-time data from Supabase
    liveStats,
    isConnected,
    
    // Admin commands
    adminMessages,
    sendAdminCommand,
    
    // Actions
    banUser: (userId: string, reason: string) => 
      sendAdminCommand('ban_user', { userId, reason }),
    broadcast: (message: string) => 
      sendAdminCommand('broadcast', { message }),
    refreshAnalytics: () => 
      sendAdminCommand('refresh_analytics', {})
  }
}