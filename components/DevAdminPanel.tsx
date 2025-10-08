'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRealtime } from '@/components/RealtimeProvider'
import { useState } from 'react'
import {
  Activity,
  Users,
  MessageSquare,
  BarChart3,
  Wifi,
  WifiOff,
  RefreshCw,
  Ban,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap
} from 'lucide-react'

interface DevAdminPanelProps {
  className?: string
}

export function DevAdminPanel({ className }: DevAdminPanelProps) {
  const { liveStats, isConnected: supabaseConnected, recentEvents } = useRealtime()
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Simulate ban user via Supabase (for development)
  const handleBanUserViaSupa = async (userId: string, reason: string) => {
    try {
      setIsRefreshing(true)
      console.log('🚫 Simulating ban via Supabase:', { userId, reason })
      
      // In a real implementation, this would call your ban API
      // For now, we'll just log it and trigger a refresh
      const response = await fetch('/api/admin/ban-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason })
      })
      
      if (response.ok) {
        console.log('✅ User banned successfully')
      } else {
        console.log('❌ Ban failed:', await response.text())
      }
    } catch (error) {
      console.error('❌ Ban error:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Development Mode Notice */}
      <Card className="bg-blue-950/20 border-blue-600">
        <CardHeader>
          <CardTitle className="text-blue-300 flex items-center gap-2">
            <Info className="h-5 w-5" />
            Development Mode - Real-time System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-400" />
              <span className="text-sm text-blue-300">
                <strong>Supabase Realtime:</strong> Active and working for live data updates
              </span>
            </div>
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-blue-300">
                <strong>WebSocket:</strong> Disabled in development (Next.js limitation)
              </span>
            </div>
            <div className="p-3 bg-blue-900/20 rounded border border-blue-500 text-xs text-blue-200">
              <strong>💡 For full WebSocket testing:</strong> Run <code className="bg-black/20 px-1 rounded">npm run build && npm start</code> or deploy to production
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <Card className="bg-black border-violet-600">
        <CardHeader>
          <CardTitle className="text-violet-300 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              {supabaseConnected ? (
                <Wifi className="h-4 w-4 text-green-400" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-400" />
              )}
              <span className="text-sm">
                Supabase: <Badge className={supabaseConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                  {supabaseConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 text-yellow-400" />
              <span className="text-sm">
                WebSocket: <Badge className="bg-yellow-500/20 text-yellow-400">
                  Dev Mode (Disabled)
                </Badge>
              </span>
            </div>
          </div>
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
              onClick={() => window.location.reload()}
              disabled={isRefreshing}
              className="text-violet-300 border-violet-600 hover:bg-violet-950/20"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh Dashboard
            </Button>
            <Badge className="bg-violet-500/20 text-violet-300">
              Total Events: {liveStats.totalEvents}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Development Tools */}
      <Card className="bg-black border-green-600">
        <CardHeader>
          <CardTitle className="text-green-300 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Development Admin Tools
          </CardTitle>
          <CardDescription className="text-green-400">
            Available functions in development mode
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* User Management */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-green-300">User Management</h4>
              <div className="space-y-2 text-xs text-green-200">
                <div>• View users in "User Management" tab</div>
                <div>• Ban users via Clerk admin API</div>
                <div>• User status tracked in Supabase</div>
                <div>• Ban detection via Realtime</div>
              </div>
            </div>

            {/* Analytics */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-green-300">Analytics</h4>
              <div className="space-y-2 text-xs text-green-200">
                <div>• Live counters via Supabase Realtime</div>
                <div>• Advanced Analytics in "Advanced" tab</div>
                <div>• Real-time event monitoring</div>
                <div>• Database change subscriptions</div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-green-800">
            <div className="text-xs text-green-300">
              <strong>✅ Working in Development:</strong> All Supabase Realtime features, user management, analytics, ban detection
            </div>
            <div className="text-xs text-yellow-300 mt-1">
              <strong>⚠️ Production Only:</strong> WebSocket admin commands (broadcast, instant ban)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-black border-violet-600">
        <CardHeader>
          <CardTitle className="text-violet-300 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Database Events
          </CardTitle>
          <CardDescription className="text-violet-400">
            Live updates from Supabase Realtime
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
                No recent events - try creating some data!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}