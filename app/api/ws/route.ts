// Native WebSocket API for admin commands
// Runs on Edge runtime for low latency
export const runtime = 'edge'

// Types for WebSocket messages
interface WSMessage {
  type: 'ping' | 'auth' | 'admin:broadcast' | 'admin:ban_user' | 'admin:refresh_analytics'
  token?: string
  userId?: string
  data?: any
  payload?: any
}

interface WSResponse {
  type: 'pong' | 'auth:success' | 'auth:error' | 'broadcast' | 'ban_executed' | 'analytics_refresh'
  data?: any
  error?: string
  timestamp?: number
}

// In-memory storage for active connections
// NOTE: This resets on serverless function cold start - consider Redis for production
const connections = new Map<WebSocket, { userId: string; isAdmin: boolean; joinedAt: number }>()

// Room management
const rooms = {
  admins: new Set<WebSocket>(),
  users: new Map<string, WebSocket>() // userId -> WebSocket
}

// Helper functions
function broadcast(room: Set<WebSocket>, message: WSResponse) {
  room.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    }
  })
}

function sendToUser(userId: string, message: WSResponse) {
  const ws = rooms.users.get(userId)
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message))
  }
}

// Simple JWT verification (replace with your Clerk verification)
async function verifyToken(token: string): Promise<{ userId: string; isAdmin: boolean } | null> {
  try {
    // TEMPORARY: Basic validation - replace with proper Clerk JWT verification
    if (!token) return null
    
    // For now, simulate verification - REPLACE THIS with actual Clerk verification
    const isAdmin = token.includes('admin') // TEMPORARY: Replace with actual admin check
    const userId = token.split('.')[0] || 'anonymous' // TEMPORARY: Extract user ID properly
    
    return { userId, isAdmin }
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export async function GET(request: Request) {
  // Check if this is a WebSocket upgrade request
  const upgrade = request.headers.get('upgrade')
  if (upgrade !== 'websocket') {
    return new Response('Expected websocket upgrade', { status: 400 })
  }

  // Create WebSocket pair
  const [client, server] = Object.values(new WebSocketPair())
  
  // Accept the connection
  server.accept()

  let connectionInfo: { userId: string; isAdmin: boolean } | null = null

  // Handle incoming messages
  server.addEventListener('message', async (event) => {
    try {
      const message: WSMessage = JSON.parse(event.data as string)
      
      switch (message.type) {
        case 'ping':
          server.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }))
          break

        case 'auth':
          if (!message.token) {
            server.send(JSON.stringify({ 
              type: 'auth:error', 
              error: 'Token required',
              timestamp: Date.now()
            }))
            server.close()
            return
          }

          const verified = await verifyToken(message.token)
          if (!verified) {
            server.send(JSON.stringify({ 
              type: 'auth:error', 
              error: 'Invalid token',
              timestamp: Date.now()
            }))
            server.close()
            return
          }

          // Store connection info
          connectionInfo = verified
          connections.set(server, {
            userId: verified.userId,
            isAdmin: verified.isAdmin,
            joinedAt: Date.now()
          })

          // Add to appropriate rooms
          if (verified.isAdmin) {
            rooms.admins.add(server)
          }
          rooms.users.set(verified.userId, server)

          server.send(JSON.stringify({ 
            type: 'auth:success', 
            data: { userId: verified.userId, isAdmin: verified.isAdmin },
            timestamp: Date.now()
          }))
          break

        case 'admin:broadcast':
          if (!connectionInfo?.isAdmin) {
            server.send(JSON.stringify({ 
              type: 'auth:error', 
              error: 'Admin access required',
              timestamp: Date.now()
            }))
            return
          }

          // Broadcast to all admin connections
          broadcast(rooms.admins, {
            type: 'broadcast',
            data: {
              message: message.data?.message || 'Admin broadcast',
              from: connectionInfo.userId,
              timestamp: Date.now()
            }
          })
          break

        case 'admin:ban_user':
          if (!connectionInfo?.isAdmin) {
            server.send(JSON.stringify({ 
              type: 'auth:error', 
              error: 'Admin access required',
              timestamp: Date.now()
            }))
            return
          }

          const targetUserId = message.data?.userId
          if (!targetUserId) {
            server.send(JSON.stringify({ 
              type: 'auth:error', 
              error: 'User ID required',
              timestamp: Date.now()
            }))
            return
          }

          // Send ban notification to specific user
          sendToUser(targetUserId, {
            type: 'ban_executed',
            data: {
              reason: message.data?.reason || 'Policy violation',
              bannedBy: connectionInfo.userId,
              timestamp: Date.now()
            }
          })

          // Confirm to admin
          server.send(JSON.stringify({
            type: 'ban_executed',
            data: {
              targetUserId,
              success: true,
              timestamp: Date.now()
            }
          }))
          break

        case 'admin:refresh_analytics':
          if (!connectionInfo?.isAdmin) {
            server.send(JSON.stringify({ 
              type: 'auth:error', 
              error: 'Admin access required',
              timestamp: Date.now()
            }))
            return
          }

          // Broadcast refresh signal to all admins
          broadcast(rooms.admins, {
            type: 'analytics_refresh',
            data: {
              triggeredBy: connectionInfo.userId,
              timestamp: Date.now()
            }
          })
          break

        default:
          server.send(JSON.stringify({ 
            type: 'auth:error', 
            error: `Unknown message type: ${message.type}`,
            timestamp: Date.now()
          }))
      }
    } catch (error) {
      console.error('WebSocket message handling error:', error)
      server.send(JSON.stringify({ 
        type: 'auth:error', 
        error: 'Invalid message format',
        timestamp: Date.now()
      }))
    }
  })

  // Handle connection close
  server.addEventListener('close', () => {
    if (connectionInfo) {
      // Remove from all rooms
      connections.delete(server)
      rooms.admins.delete(server)
      rooms.users.delete(connectionInfo.userId)
      
      console.log(`WebSocket connection closed for user: ${connectionInfo.userId}`)
    }
  })

  // Handle errors
  server.addEventListener('error', (error) => {
    console.error('WebSocket error:', error)
  })

  // Send initial connection confirmation
  server.send(JSON.stringify({
    type: 'auth:success',
    data: { 
      message: 'WebSocket connected. Please authenticate.',
      timestamp: Date.now(),
      totalConnections: connections.size
    }
  }))

  // Return response with WebSocket client
  return new Response(null, {
    status: 101,
    webSocket: client,
  })
}