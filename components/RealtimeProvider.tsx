'use client'

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react'
import { 
  RealtimeEvent, 
  createBatchSubscription,
  aggregateRealtimeEvents 
} from '@/lib/supabase-realtime'

// Context types
interface RealtimeContextType {
  // Connection status
  isConnected: boolean
  
  // Recent events (last 50)
  recentEvents: RealtimeEvent[]
  
  // Aggregated statistics
  liveStats: {
    companions: { created: number; updated: number; deleted: number }
    sessions: { created: number; updated: number; deleted: number }
    recaps: { created: number; updated: number; deleted: number }
    feedback: { created: number; updated: number; deleted: number }
    totalEvents: number
  }
  
  // Manual refresh trigger
  refreshStats: () => void
  
  // Event listeners
  addEventListener: (callback: (event: RealtimeEvent) => void) => () => void
}

interface RealtimeProviderProps {
  children: ReactNode
  maxEvents?: number // Maximum events to keep in memory
  tables?: string[] // Tables to subscribe to
  onEvent?: (event: RealtimeEvent) => void // Global event handler
}

const RealtimeContext = createContext<RealtimeContextType | null>(null)

export function RealtimeProvider({ 
  children, 
  maxEvents = 50,
  tables = ['companions', 'session_history', 'session_recaps', 'feedback'],
  onEvent
}: RealtimeProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [recentEvents, setRecentEvents] = useState<RealtimeEvent[]>([])
  const [liveStats, setLiveStats] = useState({
    companions: { created: 0, updated: 0, deleted: 0 },
    sessions: { created: 0, updated: 0, deleted: 0 },
    recaps: { created: 0, updated: 0, deleted: 0 },
    feedback: { created: 0, updated: 0, deleted: 0 },
    totalEvents: 0
  })
  
  const subscriptionRef = useRef<{ unsubscribeAll: () => void } | null>(null)
  const eventListenersRef = useRef<Set<(event: RealtimeEvent) => void>>(new Set())
  const statsStartTimeRef = useRef(Date.now())

  // Handle incoming realtime events
  const handleRealtimeEvent = (event: RealtimeEvent) => {
    console.log('📡 Realtime event received:', event)
    
    // Update recent events
    setRecentEvents(prev => {
      const updated = [event, ...prev].slice(0, maxEvents)
      
      // Update aggregated stats
      const newStats = aggregateRealtimeEvents(updated)
      setLiveStats(newStats)
      
      return updated
    })
    
    // Notify global handler
    onEvent?.(event)
    
    // Notify individual listeners
    eventListenersRef.current.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in realtime event listener:', error)
      }
    })
  }

  // Initialize subscriptions
  useEffect(() => {
    console.log('🔌 Initializing Supabase Realtime subscriptions...')
    setIsConnected(false)
    
    // Create subscriptions for all specified tables
    const tableSubscriptions = tables.map(table => ({
      table,
      callback: handleRealtimeEvent
    }))
    
    const subscription = createBatchSubscription(tableSubscriptions)
    subscriptionRef.current = subscription
    
    // Simulate connection status (Supabase doesn't provide direct status)
    const connectionTimer = setTimeout(() => {
      setIsConnected(true)
      console.log('✅ Supabase Realtime connected')
    }, 2000)
    
    // Cleanup on unmount
    return () => {
      clearTimeout(connectionTimer)
      if (subscriptionRef.current) {
        console.log('🔌 Cleaning up Supabase Realtime subscriptions')
        subscriptionRef.current.unsubscribeAll()
        subscriptionRef.current = null
      }
      setIsConnected(false)
    }
  }, [tables.join(',')]) // Re-subscribe if tables change

  // Add event listener
  const addEventListener = (callback: (event: RealtimeEvent) => void) => {
    eventListenersRef.current.add(callback)
    
    // Return cleanup function
    return () => {
      eventListenersRef.current.delete(callback)
    }
  }

  // Manual stats refresh
  const refreshStats = () => {
    console.log('🔄 Refreshing realtime stats...')
    setRecentEvents([])
    setLiveStats({
      companions: { created: 0, updated: 0, deleted: 0 },
      sessions: { created: 0, updated: 0, deleted: 0 },
      recaps: { created: 0, updated: 0, deleted: 0 },
      feedback: { created: 0, updated: 0, deleted: 0 },
      totalEvents: 0
    })
    statsStartTimeRef.current = Date.now()
  }

  const contextValue: RealtimeContextType = {
    isConnected,
    recentEvents,
    liveStats,
    refreshStats,
    addEventListener
  }

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  )
}

// Hook to use the realtime context
export function useRealtime() {
  const context = useContext(RealtimeContext)
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider')
  }
  return context
}

// Specific hooks for common use cases
export function useRealtimeStats() {
  const { liveStats, isConnected } = useRealtime()
  return { liveStats, isConnected }
}

export function useRealtimeEvents(filter?: (event: RealtimeEvent) => boolean) {
  const { recentEvents, addEventListener } = useRealtime()
  const [filteredEvents, setFilteredEvents] = useState<RealtimeEvent[]>([])

  useEffect(() => {
    const filtered = filter ? recentEvents.filter(filter) : recentEvents
    setFilteredEvents(filtered)
  }, [recentEvents, filter])

  return { 
    events: filteredEvents,
    addEventListener 
  }
}

// Hook for table-specific events
export function useTableEvents(tableName: string) {
  return useRealtimeEvents(event => event.table === tableName)
}