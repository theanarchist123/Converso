'use client'

import { createClient } from '@supabase/supabase-js'

// Create a dedicated client for realtime subscriptions
// This ensures we don't interfere with the main app's Supabase client
export const supabaseRealtime = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    realtime: {
      // Optimize for frequent updates
      params: {
        eventsPerSecond: 10 // Adjust based on your app's activity
      },
    },
    // Enable automatic reconnection
    auth: {
      persistSession: false, // We don't need auth persistence for realtime-only client
    }
  }
)

// Types for realtime events
export interface RealtimeEvent {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new?: any
  old?: any
  table: string
  schema: string
  commit_timestamp: string
}

export interface RealtimePayload {
  channel: 'companions' | 'session_history' | 'session_recaps' | 'feedback' | 'user_status'
  event: RealtimeEvent
}

// Helper function to create table subscriptions
export function createTableSubscription(
  table: string,
  callback: (payload: RealtimeEvent) => void,
  filter?: string
) {
  const channel = supabaseRealtime
    .channel(`public:${table}${filter ? `:${filter}` : ''}`)
    .on(
      'postgres_changes',
      { 
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public', 
        table,
        ...(filter && { filter })
      },
      (payload) => {
        console.log(`📡 Realtime ${table}:`, payload)
        callback({
          eventType: payload.eventType as any,
          new: payload.new,
          old: payload.old,
          table,
          schema: 'public',
          commit_timestamp: payload.commit_timestamp
        })
      }
    )

  // Subscribe and return the channel for cleanup
  const subscription = channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log(`✅ Subscribed to ${table} realtime updates`)
    } else if (status === 'CHANNEL_ERROR') {
      console.error(`❌ Failed to subscribe to ${table}`)
    }
  })

  return {
    channel,
    unsubscribe: () => {
      console.log(`🔌 Unsubscribing from ${table}`)
      supabaseRealtime.removeChannel(channel)
    }
  }
}

// Predefined subscriptions for common tables
export const createCompanionsSubscription = (callback: (payload: RealtimeEvent) => void) =>
  createTableSubscription('companions', callback)

export const createSessionHistorySubscription = (callback: (payload: RealtimeEvent) => void) =>
  createTableSubscription('session_history', callback)

export const createSessionRecapsSubscription = (callback: (payload: RealtimeEvent) => void) =>
  createTableSubscription('session_recaps', callback)

export const createFeedbackSubscription = (callback: (payload: RealtimeEvent) => void) =>
  createTableSubscription('feedback', callback)

// User-specific subscription (for ban notifications)
export const createUserStatusSubscription = (
  userId: string, 
  callback: (payload: RealtimeEvent) => void
) => createTableSubscription('user_status', callback, `user_id=eq.${userId}`)

// Batch subscription helper
export function createBatchSubscription(
  tables: Array<{
    table: string
    callback: (payload: RealtimeEvent) => void
    filter?: string
  }>
) {
  const subscriptions = tables.map(({ table, callback, filter }) =>
    createTableSubscription(table, callback, filter)
  )

  return {
    unsubscribeAll: () => {
      subscriptions.forEach(sub => sub.unsubscribe())
    }
  }
}

// Analytics aggregation helper
export function aggregateRealtimeEvents(events: RealtimeEvent[]) {
  const summary = {
    companions: { created: 0, updated: 0, deleted: 0 },
    sessions: { created: 0, updated: 0, deleted: 0 },
    recaps: { created: 0, updated: 0, deleted: 0 },
    feedback: { created: 0, updated: 0, deleted: 0 },
    totalEvents: events.length
  }

  events.forEach(event => {
    const table = event.table as keyof typeof summary
    if (table !== 'totalEvents' && summary[table]) {
      switch (event.eventType) {
        case 'INSERT':
          summary[table].created++
          break
        case 'UPDATE':
          summary[table].updated++
          break
        case 'DELETE':
          summary[table].deleted++
          break
      }
    }
  })

  return summary
}