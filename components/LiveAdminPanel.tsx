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
    refreshAnalytics,
    announce,
    forceReload,
    setReadOnly
  } = useAdminWS()

  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [announcementTitle, setAnnouncementTitle] = useState('')
  const [announcementBody, setAnnouncementBody] = useState('')
  const [announcementTTL, setAnnouncementTTL] = useState(60)
  const [reloadReason, setReloadReason] = useState('System update')
  const [readOnlyEnabled, setReadOnlyEnabled] = useState(false)
  const [readOnlyReason, setReadOnlyReason] = useState('Maintenance')
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

  const handleAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementBody.trim()) return
    setIsLoading(true)
    
    const success = await announce(announcementTitle, announcementBody, announcementTTL)
    if (success) {
      setAnnouncementTitle('')
      setAnnouncementBody('')
      setAnnouncementTTL(60)
    }
    setIsLoading(false)
  }

  const handleForceReload = async () => {
    if (!confirm('This will force all clients to reload. Continue?')) return
    setIsLoading(true)
    
    await forceReload(reloadReason)
    setIsLoading(false)
  }

  const handleReadOnlyToggle = async () => {
    setIsLoading(true)
    
    const success = await setReadOnly(!readOnlyEnabled, readOnlyReason)
    if (success) {
      setReadOnlyEnabled(!readOnlyEnabled)
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
              <div className="font-semibold">Connection Error: {connectionError}</div>
              {connectionError.includes('Supabase') && (
                <div className="space-y-1 text-yellow-400">
                  <div className="font-semibold">Check:</div>
                  <div>• NEXT_PUBLIC_SUPABASE_URL is set in .env.local</div>
                  <div>• NEXT_PUBLIC_SUPABASE_ANON_KEY is set in .env.local</div>
                  <div>• Restart dev server after adding env vars</div>
                  <div>• Check browser console for detailed logs</div>
                </div>
              )}
            </div>
          )}
          
          {/* Debug Info */}
          {!wsConnected && !isConnecting && (
            <div className="mt-3 p-3 bg-yellow-950/20 border border-yellow-600 rounded text-yellow-300 text-xs">
              <div className="font-semibold mb-1">⚠️ Controls are disabled because connection is not established</div>
              <div className="space-y-1">
                <div>Status: {isConnecting ? 'Connecting...' : 'Disconnected'}</div>
                <div>Check browser console (F12) for connection logs</div>
              </div>
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

      {/* Real-Time Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global Announcement */}
        <Card className="bg-black border-blue-600">
          <CardHeader>
            <CardTitle className="text-blue-300 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Global Announcement
            </CardTitle>
            <CardDescription className="text-blue-400">
              Show banner to all users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm text-blue-300">Title</label>
              <input
                type="text"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                placeholder="e.g., Maintenance"
                className="w-full px-3 py-2 bg-blue-950/20 border border-blue-600 rounded text-white placeholder-blue-400 text-sm"
                disabled={!wsConnected}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-blue-300">Message</label>
              <textarea
                value={announcementBody}
                onChange={(e) => setAnnouncementBody(e.target.value)}
                placeholder="Enter announcement..."
                rows={3}
                className="w-full px-3 py-2 bg-blue-950/20 border border-blue-600 rounded text-white placeholder-blue-400 text-sm resize-none"
                disabled={!wsConnected}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-blue-300">Duration (seconds)</label>
              <input
                type="number"
                value={announcementTTL}
                onChange={(e) => setAnnouncementTTL(parseInt(e.target.value) || 60)}
                min="10"
                max="300"
                className="w-full px-3 py-2 bg-blue-950/20 border border-blue-600 rounded text-white text-sm"
                disabled={!wsConnected}
              />
            </div>
            <Button
              onClick={handleAnnouncement}
              disabled={!wsConnected || !announcementTitle.trim() || !announcementBody.trim() || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-3 w-3 mr-1" />
              Send Announcement
            </Button>
          </CardContent>
        </Card>

        {/* Force Reload */}
        <Card className="bg-black border-orange-600">
          <CardHeader>
            <CardTitle className="text-orange-300 flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Force Client Reload
            </CardTitle>
            <CardDescription className="text-orange-400">
              Refresh all connected clients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm text-orange-300">Reason</label>
              <input
                type="text"
                value={reloadReason}
                onChange={(e) => setReloadReason(e.target.value)}
                placeholder="e.g., Deploy hotfix"
                className="w-full px-3 py-2 bg-orange-950/20 border border-orange-600 rounded text-white placeholder-orange-400 text-sm"
                disabled={!wsConnected}
              />
            </div>
            <div className="p-3 bg-orange-950/20 border border-orange-600 rounded text-orange-300 text-xs">
              ⚠️ This will immediately reload all client browsers. Use with caution!
            </div>
            <Button
              onClick={handleForceReload}
              disabled={!wsConnected || isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Force Reload All
            </Button>
          </CardContent>
        </Card>

        {/* Read-Only Mode */}
        <Card className="bg-black border-purple-600">
          <CardHeader>
            <CardTitle className="text-purple-300 flex items-center gap-2">
              <Ban className="h-5 w-5" />
              Read-Only Mode
            </CardTitle>
            <CardDescription className="text-purple-400">
              Disable forms/actions globally
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm text-purple-300">Reason</label>
              <input
                type="text"
                value={readOnlyReason}
                onChange={(e) => setReadOnlyReason(e.target.value)}
                placeholder="e.g., Maintenance window"
                className="w-full px-3 py-2 bg-purple-950/20 border border-purple-600 rounded text-white placeholder-purple-400 text-sm"
                disabled={!wsConnected}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-950/20 border border-purple-600 rounded">
              <span className="text-sm text-purple-300">Current Status:</span>
              <Badge className={readOnlyEnabled ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>
                {readOnlyEnabled ? 'READ-ONLY' : 'NORMAL'}
              </Badge>
            </div>
            <Button
              onClick={handleReadOnlyToggle}
              disabled={!wsConnected || isLoading}
              className={`w-full ${readOnlyEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'}`}
            >
              <Ban className="h-3 w-3 mr-1" />
              {readOnlyEnabled ? 'Disable Read-Only' : 'Enable Read-Only'}
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