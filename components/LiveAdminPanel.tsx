'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useRealtime } from '@/components/RealtimeProvider'
import { useAdminWS } from '@/hooks/useAdminWS'
import { useState } from 'react'
import {
  Activity,
  Users,
  MessageSquare,
  BarChart3,
  Wifi,
  WifiOff,
  Send,
  RefreshCw,
  Ban,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface LiveAdminPanelProps {
  className?: string
}

export function LiveAdminPanel({ className }: LiveAdminPanelProps) {
  const { liveStats, isConnected: supabaseConnected, recentEvents } = useRealtime()
  const { 
    isConnected: wsConnected, 
    isConnecting,
    connectionError,
    messages,
    broadcast, 
    banUser, 
    refreshAnalytics 
  } = useAdminWS()

  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [banUserId, setBanUserId] = useState('')
  const [banReason, setBanReason] = useState('Policy violation')
  const [isLoading, setIsLoading] = useState(false)

  // Connection status
  const connectionStatus = {
    supabase: supabaseConnected,
    websocket: wsConnected,
    overall: supabaseConnected && wsConnected
  }

  // Handle admin actions
  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) return
    setIsLoading(true)
    
    const success = await broadcast(broadcastMessage)
    if (success) {
      setBroadcastMessage('')
    }
    setIsLoading(false)
  }

  const handleBanUser = async () => {
    if (!banUserId.trim()) return
    setIsLoading(true)
    
    const success = await banUser(banUserId, banReason)
    if (success) {
      setBanUserId('')
      setBanReason('Policy violation')
    }
    setIsLoading(false)
  }

  const handleRefreshAnalytics = async () => {
    setIsLoading(true)
    await refreshAnalytics()
    setIsLoading(false)
  }

  // Get recent WebSocket messages
  const recentWSMessages = messages.slice(-5)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Connection Status */}
      <Card className="bg-black border-violet-600">
        <CardHeader>
          <CardTitle className="text-violet-300 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              {connectionStatus.supabase ? (
                <Wifi className="h-4 w-4 text-green-400" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-400" />
              )}
              <span className="text-sm">
                Supabase: <Badge className={connectionStatus.supabase ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                  {connectionStatus.supabase ? 'Connected' : 'Disconnected'}
                </Badge>
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {wsConnected ? (
                <Wifi className="h-4 w-4 text-green-400" />
              ) : isConnecting ? (
                <Clock className="h-4 w-4 text-yellow-400" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-400" />
              )}
              <span className="text-sm">
                WebSocket: <Badge className={
                  wsConnected ? 'bg-green-500/20 text-green-400' : 
                  isConnecting ? 'bg-yellow-500/20 text-yellow-400' : 
                  'bg-red-500/20 text-red-400'
                }>
                  {wsConnected ? 'Connected' : isConnecting ? 'Connecting' : 'Disconnected'}
                </Badge>
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {connectionStatus.overall ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
              )}
              <span className="text-sm">
                Status: <Badge className={connectionStatus.overall ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                  {connectionStatus.overall ? 'All Systems Online' : 'Partial Connection'}
                </Badge>
              </span>
            </div>
          </div>
          
          {connectionError && (
            <div className="mt-3 p-3 bg-red-950/20 border border-red-600 rounded text-red-400 text-xs space-y-2">
              <div className="font-semibold">WebSocket Error: {connectionError}</div>
              {process.env.NODE_ENV === 'development' && connectionError.includes('dev server') && (
                <div className="space-y-1 text-yellow-400">
                  <div className="font-semibold">Development Mode Solutions:</div>
                  <div>• Build for production: <code className="bg-black/20 px-1 rounded">npm run build && npm start</code></div>
                  <div>• Use ngrok for dev: <code className="bg-black/20 px-1 rounded">ngrok http 3000</code></div>
                  <div>• Supabase Realtime will still work for live data updates</div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Statistics */}
      <Card className="bg-black border-violet-600">
        <CardHeader>
          <CardTitle className="text-violet-300 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Live Analytics Dashboard
          </CardTitle>
          <CardDescription className="text-violet-400">
            Real-time updates from Supabase • Session: {recentEvents.length} events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-violet-400">Companions</div>
              <div className="text-2xl font-bold text-white">{liveStats.companions.created}</div>
              <div className="text-xs text-green-400">+{liveStats.companions.created} created</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-violet-400">Sessions</div>
              <div className="text-2xl font-bold text-white">{liveStats.sessions.created}</div>
              <div className="text-xs text-blue-400">+{liveStats.sessions.created} started</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-violet-400">Recaps</div>
              <div className="text-2xl font-bold text-white">{liveStats.recaps.created}</div>
              <div className="text-xs text-purple-400">+{liveStats.recaps.created} generated</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-violet-400">Feedback</div>
              <div className="text-2xl font-bold text-white">{liveStats.feedback.created}</div>
              <div className="text-xs text-yellow-400">+{liveStats.feedback.created} submitted</div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAnalytics}
              disabled={!wsConnected || isLoading}
              className="text-violet-300 border-violet-600 hover:bg-violet-950/20"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh All Dashboards
            </Button>
            <Badge className="bg-violet-500/20 text-violet-300">
              Total Events: {liveStats.totalEvents}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Admin Commands */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Broadcast Message */}
        <Card className="bg-black border-violet-600">
          <CardHeader>
            <CardTitle className="text-violet-300 flex items-center gap-2">
              <Send className="h-5 w-5" />
              Admin Broadcast
            </CardTitle>
            <CardDescription className="text-violet-400">
              Send instant message to all admin dashboards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm text-violet-300">Message</label>
              <input
                type="text"
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Enter broadcast message..."
                className="w-full px-3 py-2 bg-violet-950/20 border border-violet-600 rounded text-white placeholder-violet-400 text-sm"
                disabled={!wsConnected}
              />
            </div>
            <Button
              onClick={handleBroadcast}
              disabled={!wsConnected || !broadcastMessage.trim() || isLoading}
              className="w-full bg-violet-600 hover:bg-violet-700"
            >
              <Send className="h-3 w-3 mr-1" />
              Send Broadcast
            </Button>
          </CardContent>
        </Card>

        {/* Ban User */}
        <Card className="bg-black border-red-600">
          <CardHeader>
            <CardTitle className="text-red-300 flex items-center gap-2">
              <Ban className="h-5 w-5" />
              Instant User Ban
            </CardTitle>
            <CardDescription className="text-red-400">
              Immediately ban user and force logout
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm text-red-300">User ID</label>
              <input
                type="text"
                value={banUserId}
                onChange={(e) => setBanUserId(e.target.value)}
                placeholder="Enter user ID to ban..."
                className="w-full px-3 py-2 bg-red-950/20 border border-red-600 rounded text-white placeholder-red-400 text-sm"
                disabled={!wsConnected}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-red-300">Reason</label>
              <input
                type="text"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Ban reason..."
                className="w-full px-3 py-2 bg-red-950/20 border border-red-600 rounded text-white placeholder-red-400 text-sm"
                disabled={!wsConnected}
              />
            </div>
            <Button
              onClick={handleBanUser}
              disabled={!wsConnected || !banUserId.trim() || isLoading}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <Ban className="h-3 w-3 mr-1" />
              Execute Ban
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supabase Events */}
        <Card className="bg-black border-violet-600">
          <CardHeader>
            <CardTitle className="text-violet-300 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Database Events
            </CardTitle>
            <CardDescription className="text-violet-400">
              Live updates from Supabase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recentEvents.slice(0, 10).map((event, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 bg-violet-950/20 rounded text-xs">
                  <div className="flex items-center gap-2">
                    <Badge className={
                      event.eventType === 'INSERT' ? 'bg-green-500/20 text-green-400' :
                      event.eventType === 'UPDATE' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-red-500/20 text-red-400'
                    }>
                      {event.eventType}
                    </Badge>
                    <span className="text-violet-300">{event.table}</span>
                  </div>
                  <span className="text-violet-400">
                    {new Date(event.commit_timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
              {recentEvents.length === 0 && (
                <div className="text-center py-8 text-violet-400 text-sm">
                  No recent events
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* WebSocket Messages */}
        <Card className="bg-black border-violet-600">
          <CardHeader>
            <CardTitle className="text-violet-300 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              WebSocket Messages
            </CardTitle>
            <CardDescription className="text-violet-400">
              Admin command responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recentWSMessages.map((msg, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 bg-violet-950/20 rounded text-xs">
                  <div className="flex items-center gap-2">
                    <Badge className={
                      msg.type.includes('success') ? 'bg-green-500/20 text-green-400' :
                      msg.type.includes('error') ? 'bg-red-500/20 text-red-400' :
                      'bg-blue-500/20 text-blue-400'
                    }>
                      {msg.type}
                    </Badge>
                    <span className="text-violet-300 truncate">
                      {msg.data?.message || JSON.stringify(msg.data)?.slice(0, 30)}
                    </span>
                  </div>
                  <span className="text-violet-400">
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : 'now'}
                  </span>
                </div>
              ))}
              {recentWSMessages.length === 0 && (
                <div className="text-center py-8 text-violet-400 text-sm">
                  No recent messages
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}