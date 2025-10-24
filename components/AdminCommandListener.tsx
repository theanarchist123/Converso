'use client'

import { useEffect, useState } from 'react'
import { supabaseRealtime } from '@/lib/supabase-realtime'
import { useToast } from '@/hooks/use-toast'

interface AdminMessage {
  type: string
  data?: any
  timestamp?: number
}

export function AdminCommandListener() {
  const { toast } = useToast()
  const [readOnlyMode, setReadOnlyMode] = useState(false)

  useEffect(() => {
    // Subscribe to admin commands channel
    const channel = supabaseRealtime.channel('admin_commands', {
      config: { broadcast: { self: false } } // Don't receive own messages
    })

    channel.on('broadcast', { event: 'admin' }, (payload) => {
      const msg: AdminMessage = payload.payload
      console.log('📥 Received admin command:', msg)

      handleAdminCommand(msg)
    })

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Subscribed to admin commands')
      }
    })

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const handleAdminCommand = (msg: AdminMessage) => {
    switch (msg.type) {
      case 'admin:announce':
        // Show announcement banner/toast
        toast({
          title: msg.data?.title || 'Announcement',
          description: msg.data?.body || '',
          duration: (msg.data?.ttlSec || 60) * 1000,
          variant: 'default'
        })
        break

      case 'admin:force_reload':
        // Show warning toast then reload
        toast({
          title: '🔄 System Update',
          description: msg.data?.reason || 'The application will reload now.',
          duration: 3000,
          variant: 'destructive'
        })
        
        setTimeout(() => {
          window.location.reload()
        }, 3000)
        break

      case 'admin:read_only':
        // Set read-only mode
        const enabled = msg.data?.enabled ?? false
        setReadOnlyMode(enabled)
        localStorage.setItem('app.readOnly', enabled ? '1' : '0')
        
        toast({
          title: enabled ? '🔒 Read-Only Mode Enabled' : '✅ Read-Only Mode Disabled',
          description: msg.data?.reason || (enabled ? 'Forms and actions are temporarily disabled.' : 'Full functionality restored.'),
          duration: 5000,
          variant: enabled ? 'destructive' : 'default'
        })
        break

      case 'admin:broadcast':
        // Show broadcast message
        toast({
          title: '📢 Admin Message',
          description: msg.data?.message || '',
          duration: 10000,
        })
        break

      case 'admin:refresh_analytics':
        // Trigger analytics refresh if on analytics page
        console.log('📊 Analytics refresh requested')
        window.dispatchEvent(new CustomEvent('admin:refresh_analytics'))
        break
    }
  }

  // Render read-only indicator if enabled
  if (readOnlyMode) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 text-sm font-medium">
        🔒 Read-Only Mode Active - Actions are temporarily disabled
      </div>
    )
  }

  return null
}
