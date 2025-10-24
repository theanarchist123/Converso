import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

// Server-Sent Events for real-time admin updates
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const { userId } = await auth()
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Create SSE response
    const encoder = new TextEncoder()
    const customReadable = new ReadableStream({
      start(controller) {
        // Send initial connection message
        const data = `data: ${JSON.stringify({
          type: 'connected',
          message: 'Admin SSE connected',
          timestamp: Date.now()
        })}\n\n`
        controller.enqueue(encoder.encode(data))

        // Keep connection alive with heartbeat
        const heartbeat = setInterval(() => {
          const heartbeatData = `data: ${JSON.stringify({
            type: 'heartbeat',
            timestamp: Date.now()
          })}\n\n`
          controller.enqueue(encoder.encode(heartbeatData))
        }, 30000) // Every 30 seconds

        // Clean up on close
        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeat)
          controller.close()
        })
      }
    })

    return new Response(customReadable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    })

  } catch (error) {
    console.error('SSE Error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}