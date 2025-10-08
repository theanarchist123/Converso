'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  UserCheck, 
  UserX, 
  TrendingUp,
  Shield,
  Settings,
  BarChart3,
  AlertTriangle,
  Search,
  Filter,
  Activity
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BarChartComponent as BarChart } from '@/components/charts/BarChart'
import { PieChartInteractive } from '@/components/charts/PieChartInteractive'
import { LineChartComponent as LineChart } from '@/components/charts/LineChart'
import AdvancedAnalytics from '@/components/AdvancedAnalytics'
import { RadarChartComponent as RadarChart } from '@/components/charts/RadarChart'
import { LiveAdminPanel } from '@/components/LiveAdminPanel'
import { DevAdminPanel } from '@/components/DevAdminPanel'

interface UserData {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  status: 'active' | 'inactive' | 'pending' | 'banned' | 'suspended'
  lastActive: string
  joinedDate: string
  banned?: boolean
  publicMetadata?: any
}

interface PendingAction {
  type: 'approve' | 'ban' | 'suspend' | 'delete'
  user: UserData
}

interface StatCard {
  title: string
  value: string
  change: string
  icon: React.ElementType
}

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState<UserData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [adminUser, setAdminUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [userError, setUserError] = useState<string | null>(null)

  // Real-time stats from API
  const stats: StatCard[] = analyticsData ? [
    {
      title: "Total Users",
      value: analyticsData.summary.totalUsers.toLocaleString(),
      change: `+${analyticsData.summary.userGrowthPercent}%`,
      icon: Users
    },
    {
      title: "Active Sessions",
      value: analyticsData.summary.totalSessions.toLocaleString(),
      change: "+8.2%",
      icon: UserCheck
    },
    {
      title: "Total Companions",
      value: analyticsData.summary.totalCompanions.toLocaleString(),
      change: "+5.3%",
      icon: UserX
    },
    {
      title: "New Users (7d)",
      value: analyticsData.summary.newUsersThisWeek.toString(),
      change: `+${analyticsData.summary.userGrowthPercent}%`,
      icon: TrendingUp
    }
  ] : []

  // Fetch real users from Clerk API
  const fetchUsers = async () => {
    setIsLoadingUsers(true)
    setUserError(null)
    
    try {
      const token = localStorage.getItem('admin_token')
      
      if (!token) {
        console.error('❌ No admin token found')
        setUserError('Not authenticated. Please login to admin panel again.')
        setIsLoadingUsers(false)
        
        // Redirect to admin login after 2 seconds
        setTimeout(() => {
          window.location.href = '/admin/login'
        }, 2000)
        return
      }
      
      console.log('🔄 Fetching users from API...')
      
      const response = await fetch('/api/admin/users?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('📡 API Response status:', response.status)
      
      if (response.status === 401) {
        // Token expired or invalid
        console.error('❌ Admin session expired')
        setUserError('Your admin session has expired. Redirecting to login...')
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin')
        
        setTimeout(() => {
          window.location.href = '/admin/login'
        }, 2000)
        return
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ API Error:', errorData)
        throw new Error(errorData.error || `Failed to fetch users (${response.status})`)
      }
      
      const result = await response.json()
      console.log('📦 API Result:', { success: result.success, userCount: result.users?.length })
      
      if (result.success && result.users) {
        // Transform Clerk user data to match our UserData interface
        const transformedUsers: UserData[] = result.users.map((user: any) => ({
          id: user.id,
          firstName: user.firstName || 'N/A',
          lastName: user.lastName || 'N/A',
          email: user.email,
          role: user.publicMetadata?.role || 'free_user',
          status: user.banned ? 'banned' : (user.publicMetadata?.status || 'active'),
          lastActive: user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : 'Never',
          joinedDate: new Date(user.createdAt).toLocaleDateString(),
          banned: user.banned,
          publicMetadata: user.publicMetadata
        }))
        
        setUsers(transformedUsers)
        console.log(`✅ Loaded ${transformedUsers.length} users from Clerk`)
      } else {
        console.error('❌ Invalid API response format:', result)
        throw new Error('Invalid response format from API')
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load users'
      setUserError(errorMessage)
      
      // Don't crash the entire dashboard - just show empty user list
      setUsers([])
    } finally {
      setIsLoadingUsers(false)
    }
  }

  // Fetch real analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics/dashboard')
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data')
        }
        const result = await response.json()
        if (result.success) {
          // Check if data exists, if not use mock data
          const hasRealData = result.data.userGrowthData?.some((item: any) => item.users > 0)
          
          if (hasRealData) {
            setAnalyticsData(result.data)
          } else {
            // Use mock data for demonstration
            setAnalyticsData({
              summary: {
                totalUsers: 2341,
                totalSessions: 1892,
                totalCompanions: 156,
                totalFeedback: 89,
                newUsersThisWeek: 47,
                userGrowthPercent: 12.5
              },
              userGrowthData: [
                { name: 'Jan', users: 1850 },
                { name: 'Feb', users: 1920 },
                { name: 'Mar', users: 2010 },
                { name: 'Apr', users: 2100 },
                { name: 'May', users: 2180 },
                { name: 'Jun', users: 2210 },
                { name: 'Jul', users: 2250 },
                { name: 'Aug', users: 2280 },
                { name: 'Sep', users: 2310 },
                { name: 'Oct', users: 2341 },
                { name: 'Nov', users: 0 },
                { name: 'Dec', users: 0 }
              ],
              statusDistributionData: [
                {
                  month: 'January',
                  data: [
                    { name: 'Active', users: 1250, fill: '#8B5CF6' },
                    { name: 'Inactive', users: 450, fill: '#7C3AED' },
                    { name: 'New', users: 150, fill: '#A855F7' }
                  ]
                },
                {
                  month: 'February',
                  data: [
                    { name: 'Active', users: 1320, fill: '#8B5CF6' },
                    { name: 'Inactive', users: 420, fill: '#7C3AED' },
                    { name: 'New', users: 180, fill: '#A855F7' }
                  ]
                },
                {
                  month: 'March',
                  data: [
                    { name: 'Active', users: 1380, fill: '#8B5CF6' },
                    { name: 'Inactive', users: 450, fill: '#7C3AED' },
                    { name: 'New', users: 180, fill: '#A855F7' }
                  ]
                },
                {
                  month: 'April',
                  data: [
                    { name: 'Active', users: 1450, fill: '#8B5CF6' },
                    { name: 'Inactive', users: 470, fill: '#7C3AED' },
                    { name: 'New', users: 180, fill: '#A855F7' }
                  ]
                },
                {
                  month: 'May',
                  data: [
                    { name: 'Active', users: 1520, fill: '#8B5CF6' },
                    { name: 'Inactive', users: 480, fill: '#7C3AED' },
                    { name: 'New', users: 180, fill: '#A855F7' }
                  ]
                },
                {
                  month: 'June',
                  data: [
                    { name: 'Active', users: 1550, fill: '#8B5CF6' },
                    { name: 'Inactive', users: 490, fill: '#7C3AED' },
                    { name: 'New', users: 170, fill: '#A855F7' }
                  ]
                },
                {
                  month: 'July',
                  data: [
                    { name: 'Active', users: 1600, fill: '#8B5CF6' },
                    { name: 'Inactive', users: 480, fill: '#7C3AED' },
                    { name: 'New', users: 170, fill: '#A855F7' }
                  ]
                },
                {
                  month: 'August',
                  data: [
                    { name: 'Active', users: 1650, fill: '#8B5CF6' },
                    { name: 'Inactive', users: 470, fill: '#7C3AED' },
                    { name: 'New', users: 160, fill: '#A855F7' }
                  ]
                },
                {
                  month: 'September',
                  data: [
                    { name: 'Active', users: 1680, fill: '#8B5CF6' },
                    { name: 'Inactive', users: 470, fill: '#7C3AED' },
                    { name: 'New', users: 160, fill: '#A855F7' }
                  ]
                },
                {
                  month: 'October',
                  data: [
                    { name: 'Active', users: 1720, fill: '#8B5CF6' },
                    { name: 'Inactive', users: 461, fill: '#7C3AED' },
                    { name: 'New', users: 160, fill: '#A855F7' }
                  ]
                },
                {
                  month: 'November',
                  data: [
                    { name: 'Active', users: 0, fill: '#8B5CF6' },
                    { name: 'Inactive', users: 0, fill: '#7C3AED' },
                    { name: 'New', users: 0, fill: '#A855F7' }
                  ]
                },
                {
                  month: 'December',
                  data: [
                    { name: 'Active', users: 0, fill: '#8B5CF6' },
                    { name: 'Inactive', users: 0, fill: '#7C3AED' },
                    { name: 'New', users: 0, fill: '#A855F7' }
                  ]
                }
              ],
              engagementData: Array.from({ length: 30 }, (_, i) => {
                const date = new Date()
                date.setDate(date.getDate() - (29 - i))
                return {
                  name: `${date.getMonth() + 1}/${date.getDate()}`,
                  sessions: Math.floor(Math.random() * 50) + 20,
                  companions: Math.floor(Math.random() * 10) + 2,
                  learningLogs: Math.floor(Math.random() * 30) + 10
                }
              }),
              performanceData: [
                { metric: 'User Engagement', value: 85, fullMark: 100 },
                { metric: 'Session Quality', value: 78, fullMark: 100 },
                { metric: 'Satisfaction', value: 92, fullMark: 100 },
                { metric: 'Content Creation', value: 68, fullMark: 100 },
                { metric: 'Learning Progress', value: 75, fullMark: 100 }
              ]
            })
            setError('Using demo data - Start using the app to see real analytics!')
          }
        } else {
          setError('Failed to load analytics data')
        }
      } catch (err) {
        console.error('Error fetching analytics:', err)
        setError(err instanceof Error ? err.message : 'Failed to load analytics')
        
        // Set mock data on error
        setAnalyticsData({
          summary: {
            totalUsers: 2341,
            totalSessions: 1892,
            totalCompanions: 156,
            totalFeedback: 89,
            newUsersThisWeek: 47,
            userGrowthPercent: 12.5
          },
          userGrowthData: [
            { name: 'Jan', users: 1850 },
            { name: 'Feb', users: 1920 },
            { name: 'Mar', users: 2010 },
            { name: 'Apr', users: 2100 },
            { name: 'May', users: 2180 },
            { name: 'Jun', users: 2210 },
            { name: 'Jul', users: 2250 },
            { name: 'Aug', users: 2280 },
            { name: 'Sep', users: 2310 },
            { name: 'Oct', users: 2341 },
            { name: 'Nov', users: 0 },
            { name: 'Dec', users: 0 }
          ],
          statusDistributionData: [
            {
              month: 'January',
              data: [
                { name: 'Active', users: 1250, fill: '#8B5CF6' },
                { name: 'Inactive', users: 450, fill: '#7C3AED' },
                { name: 'New', users: 150, fill: '#A855F7' }
              ]
            },
            {
              month: 'February',
              data: [
                { name: 'Active', users: 1320, fill: '#8B5CF6' },
                { name: 'Inactive', users: 420, fill: '#7C3AED' },
                { name: 'New', users: 180, fill: '#A855F7' }
              ]
            },
            {
              month: 'March',
              data: [
                { name: 'Active', users: 1380, fill: '#8B5CF6' },
                { name: 'Inactive', users: 450, fill: '#7C3AED' },
                { name: 'New', users: 180, fill: '#A855F7' }
              ]
            },
            {
              month: 'April',
              data: [
                { name: 'Active', users: 1450, fill: '#8B5CF6' },
                { name: 'Inactive', users: 470, fill: '#7C3AED' },
                { name: 'New', users: 180, fill: '#A855F7' }
              ]
            },
            {
              month: 'May',
              data: [
                { name: 'Active', users: 1520, fill: '#8B5CF6' },
                { name: 'Inactive', users: 480, fill: '#7C3AED' },
                { name: 'New', users: 180, fill: '#A855F7' }
              ]
            },
            {
              month: 'June',
              data: [
                { name: 'Active', users: 1550, fill: '#8B5CF6' },
                { name: 'Inactive', users: 490, fill: '#7C3AED' },
                { name: 'New', users: 170, fill: '#A855F7' }
              ]
            },
            {
              month: 'July',
              data: [
                { name: 'Active', users: 1600, fill: '#8B5CF6' },
                { name: 'Inactive', users: 480, fill: '#7C3AED' },
                { name: 'New', users: 170, fill: '#A855F7' }
              ]
            },
            {
              month: 'August',
              data: [
                { name: 'Active', users: 1650, fill: '#8B5CF6' },
                { name: 'Inactive', users: 470, fill: '#7C3AED' },
                { name: 'New', users: 160, fill: '#A855F7' }
              ]
            },
            {
              month: 'September',
              data: [
                { name: 'Active', users: 1680, fill: '#8B5CF6' },
                { name: 'Inactive', users: 470, fill: '#7C3AED' },
                { name: 'New', users: 160, fill: '#A855F7' }
              ]
            },
            {
              month: 'October',
              data: [
                { name: 'Active', users: 1720, fill: '#8B5CF6' },
                { name: 'Inactive', users: 461, fill: '#7C3AED' },
                { name: 'New', users: 160, fill: '#A855F7' }
              ]
            },
            {
              month: 'November',
              data: [
                { name: 'Active', users: 0, fill: '#8B5CF6' },
                { name: 'Inactive', users: 0, fill: '#7C3AED' },
                { name: 'New', users: 0, fill: '#A855F7' }
              ]
            },
            {
              month: 'December',
              data: [
                { name: 'Active', users: 0, fill: '#8B5CF6' },
                { name: 'Inactive', users: 0, fill: '#7C3AED' },
                { name: 'New', users: 0, fill: '#A855F7' }
              ]
            }
          ],
          engagementData: Array.from({ length: 30 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (29 - i))
            return {
              name: `${date.getMonth() + 1}/${date.getDate()}`,
              sessions: Math.floor(Math.random() * 50) + 20,
              companions: Math.floor(Math.random() * 10) + 2,
              learningLogs: Math.floor(Math.random() * 30) + 10
            }
          }),
          performanceData: [
            { metric: 'User Engagement', value: 85, fullMark: 100 },
            { metric: 'Session Quality', value: 78, fullMark: 100 },
            { metric: 'Satisfaction', value: 92, fullMark: 100 },
            { metric: 'Content Creation', value: 68, fullMark: 100 },
            { metric: 'Learning Progress', value: 75, fullMark: 100 }
          ]
        })
      }
    }

    fetchAnalytics()
  }, [])

  useEffect(() => {
    // Check for admin authentication from localStorage
    const adminData = localStorage.getItem('admin')
    const adminToken = localStorage.getItem('admin_token')
    
    if (!adminData || !adminToken) {
      router.push('/admin/login')
      return
    }
    
    try {
      const admin = JSON.parse(adminData)
      setAdminUser(admin)
      fetchUsers() // Fetch real users from Clerk
      setIsLoading(false)
    } catch (error) {
      console.error('Invalid admin data:', error)
      localStorage.removeItem('admin')
      localStorage.removeItem('admin_token')
      router.push('/admin/login')
    }
  }, [router])

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-violet-900/50 text-violet-300 border-violet-600',
      premium_user: 'bg-blue-900/50 text-blue-300 border-blue-600',
      free_user: 'bg-gray-800/50 text-gray-300 border-gray-600'
    }
    return colors[role as keyof typeof colors] || 'bg-gray-800/50 text-gray-300 border-gray-600'
  }

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'text-green-400',
      inactive: 'text-gray-400',
      pending: 'text-yellow-400',
      banned: 'text-red-400',
      suspended: 'text-orange-400'
    }
    return colors[status as keyof typeof colors] || 'text-gray-400'
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleAction = (action: PendingAction['type'], user: UserData) => {
    setPendingAction({ type: action, user })
    setShowConfirmDialog(true)
  }

  const confirmAction = async () => {
    if (!pendingAction) return

    try {
      const token = localStorage.getItem('admin_token')
      const { type, user } = pendingAction
      
      console.log(`🔄 ${type}ing user:`, user.email)
      
      // Make API call to update user
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: type === 'delete' ? 'DELETE' : 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: type !== 'delete' ? JSON.stringify({ action: type }) : undefined
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update user')
      }
      
      console.log(`✅ User ${type}ed successfully:`, result)
      
      // Close dialog first
      setShowConfirmDialog(false)
      setPendingAction(null)
      
      // Refresh the user list from server to get latest data
      await fetchUsers()
      
      // Show success message with action explanation
      const successMessages = {
        ban: `User ${user.email} has been PERMANENTLY BANNED.\n\n• They cannot sign in anymore\n• If they're currently logged in, they'll be auto-logged out\n• They'll see a "You are banned" message if they try to sign in`,
        approve: `User ${user.email} has been UNBANNED.\n\n• They can now sign in normally\n• All restrictions have been removed`,
        delete: `User ${user.email} has been PERMANENTLY DELETED.\n\n• Their account no longer exists\n• If they were logged in, they've been auto-logged out\n• All their data has been removed from the system`
      }
      
      alert(`✅ SUCCESS!\n\n${successMessages[type as keyof typeof successMessages] || 'Action completed successfully!'}`)
      
    } catch (error) {
      console.error('Error updating user:', error)
      alert(`❌ FAILED!\n\nFailed to ${pendingAction.type} user: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setShowConfirmDialog(false)
      setPendingAction(null)
    }
  }

  const getNewStatus = (action: string): UserData['status'] => {
    switch (action) {
      case 'approve': return 'active'
      case 'ban': return 'banned'
      case 'delete': return 'inactive'
      default: return 'active'
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "approve": return "bg-green-600 hover:bg-green-700"
      case "ban": return "bg-red-600 hover:bg-red-700"
      case "delete": return "bg-red-700 hover:bg-red-800"
      default: return "bg-gray-600 hover:bg-gray-700"
    }
  }

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600"></div>
    </div>
  )

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!adminUser) {
    return null // Will redirect to login
  }

  return (
    <>
      <div className="min-h-screen h-full w-full bg-black text-white">
        {/* Header */}
        <header className="bg-black border-b border-violet-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and Title */}
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-violet-500 mr-3" />
                <h1 className="text-xl font-bold text-violet-300">Admin Dashboard</h1>
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-4">
                <span className="text-violet-300">
                  {adminUser.firstName} {adminUser.lastName}
                </span>
                <Button
                  onClick={() => {
                    localStorage.removeItem('admin')
                    localStorage.removeItem('admin_token')
                    router.push('/admin/login')
                  }}
                  variant="outline"
                  className="bg-black border-violet-600 text-violet-300 hover:bg-violet-900/20"
                >
                  Logout
                </Button>
                <Button
                  onClick={() => router.push('/app')}
                  variant="outline"
                  className="bg-black border-violet-600 text-violet-300 hover:bg-violet-900/20"
                >
                  Back to App
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="bg-black border-b border-violet-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'users', label: 'User Management', icon: Users },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'advanced', label: 'Advanced Analytics', icon: Settings },
                { id: 'realtime', label: 'Real-time Control', icon: Activity }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-4 text-sm font-medium transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-b-2 border-violet-500 text-violet-300'
                      : 'text-violet-400 hover:text-violet-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-black">
          {/* Error Message */}
          {error && (
            <div className={`mb-6 px-4 py-3 rounded-lg flex items-center ${
              error.includes('demo data') 
                ? 'bg-blue-900/20 border border-blue-600 text-blue-300' 
                : 'bg-red-900/20 border border-red-600 text-red-300'
            }`}>
              <AlertTriangle className="h-5 w-5 mr-3" />
              <div>
                <span className="font-semibold">
                  {error.includes('demo data') ? '📊 Demo Mode: ' : '⚠️ '}
                </span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Stats Cards */}
                <motion.div 
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.title}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + index * 0.1 }}
                    >
                      <Card className="bg-black border-violet-600 hover:border-violet-500 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-violet-300">
                            {stat.title}
                          </CardTitle>
                          <stat.icon className="h-4 w-4 text-violet-500" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-white">
                            {stat.value}
                          </div>
                          <p className="text-xs text-violet-400">
                            {stat.change} from last month
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Charts Grid */}
                <div className="grid gap-6 md:grid-cols-2 mb-8">
                  <Card className="bg-black border-violet-600">
                    <CardHeader>
                      <CardTitle className="text-violet-300">User Growth</CardTitle>
                      <CardDescription className="text-violet-400">
                        Monthly user registration trends
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {analyticsData ? (
                        <BarChart data={analyticsData.userGrowthData} />
                      ) : (
                        <div className="flex items-center justify-center h-64">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {analyticsData ? (
                    <PieChartInteractive data={analyticsData.statusDistributionData} />
                  ) : (
                    <Card className="bg-black border-violet-600">
                      <CardContent className="pt-6 flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="bg-black border-violet-600">
                    <CardHeader>
                      <CardTitle className="text-violet-300">Engagement Trends</CardTitle>
                      <CardDescription className="text-violet-400">
                        Sessions, companions, and learning logs
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {analyticsData ? (
                        <LineChart data={analyticsData.engagementData} />
                      ) : (
                        <div className="flex items-center justify-center h-64">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-black border-violet-600">
                    <CardHeader>
                      <CardTitle className="text-violet-300">Performance Metrics</CardTitle>
                      <CardDescription className="text-violet-400">
                        Real-time system performance overview
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {analyticsData ? (
                        <RadarChart data={analyticsData.performanceData} />
                      ) : (
                        <div className="flex items-center justify-center h-64">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-violet-300">User Management</h2>
                  <Button
                    onClick={fetchUsers}
                    variant="outline"
                    className="bg-black border-violet-600 text-violet-300 hover:bg-violet-900/20"
                    disabled={isLoadingUsers}
                  >
                    {isLoadingUsers ? 'Loading...' : 'Refresh'}
                  </Button>
                </div>

                {/* Error Message */}
                {userError && (
                  <div className="mb-6 px-4 py-3 rounded-lg flex items-center bg-red-900/20 border border-red-600 text-red-300">
                    <AlertTriangle className="h-5 w-5 mr-3" />
                    <div>
                      <span className="font-semibold">⚠️ Error: </span>
                      <span>{userError}</span>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {isLoadingUsers && !userError && (
                  <div className="mb-6 px-4 py-3 rounded-lg flex items-center bg-blue-900/20 border border-blue-600 text-blue-300">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                    <span>Loading users from Clerk...</span>
                  </div>
                )}

                {/* Filters */}
                <Card className="bg-black border-violet-600 mb-6">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-violet-400" />
                          <Input
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-black border-violet-600 text-white placeholder-violet-400"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-violet-400" />
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="bg-black border border-violet-600 text-white rounded-md px-3 py-2"
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="pending">Pending</option>
                          <option value="banned">Banned</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Users Table */}
                <Card className="bg-black border-violet-600">
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-violet-600">
                          <TableHead className="text-violet-300">User</TableHead>
                          <TableHead className="text-violet-300">Role</TableHead>
                          <TableHead className="text-violet-300">Status</TableHead>
                          <TableHead className="text-violet-300">Last Active</TableHead>
                          <TableHead className="text-violet-300">Joined</TableHead>
                          <TableHead className="text-violet-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12">
                              <div className="flex flex-col items-center gap-3">
                                <Users className="h-12 w-12 text-violet-400 opacity-50" />
                                <p className="text-violet-300 font-medium">
                                  {isLoadingUsers 
                                    ? 'Loading users...' 
                                    : userError 
                                    ? 'Failed to load users' 
                                    : 'No users found'}
                                </p>
                                {!isLoadingUsers && !userError && (
                                  <p className="text-violet-400 text-sm">
                                    Try adjusting your search or filters
                                  </p>
                                )}
                                {userError && !isLoadingUsers && (
                                  <Button
                                    onClick={fetchUsers}
                                    variant="outline"
                                    className="bg-black border-violet-600 text-violet-300 hover:bg-violet-900/20 mt-2"
                                  >
                                    Retry
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredUsers.map((user) => (
                          <TableRow key={user.id} className="border-violet-600 hover:bg-violet-950/20">
                            <TableCell className="font-medium">
                              <div>
                                <div className="text-white">{user.firstName} {user.lastName}</div>
                                <div className="text-sm text-violet-400">{user.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                                {formatRole(user.role)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`font-medium ${getStatusColor(user.status)}`}>
                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell className="text-violet-300">{user.lastActive}</TableCell>
                            <TableCell className="text-violet-300">{user.joinedDate}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {user.status === 'banned' ? (
                                  <Button
                                    size="sm"
                                    onClick={() => handleAction('approve', user)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    Unban
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleAction('ban', user)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Ban
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleAction('delete', user)}
                                  className="bg-red-700 hover:bg-red-800"
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-violet-300 mb-6">Analytics Dashboard</h2>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="bg-black border-violet-600">
                    <CardHeader>
                      <CardTitle className="text-violet-300">Detailed User Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analyticsData ? (
                        <BarChart data={analyticsData.userGrowthData} />
                      ) : (
                        <div className="flex items-center justify-center h-64">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-black border-violet-600">
                    <CardHeader>
                      <CardTitle className="text-violet-300">Engagement Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analyticsData ? (
                        <LineChart data={analyticsData.engagementData} />
                      ) : (
                        <div className="flex items-center justify-center h-64">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === 'advanced' && (
              <motion.div
                key="advanced"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AdvancedAnalytics />
              </motion.div>
            )}

            {activeTab === 'realtime' && (
              <motion.div
                key="realtime"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {process.env.NODE_ENV === 'development' ? (
                  <DevAdminPanel />
                ) : (
                  <LiveAdminPanel />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-black border-violet-600 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-violet-300">
              <AlertTriangle className="h-5 w-5 text-violet-500" />
              Confirm Action
            </DialogTitle>
            <DialogDescription className="text-violet-400">
              {pendingAction && (
                <>
                  Are you sure you want to <strong>{pendingAction.type}</strong> user{" "}
                  <strong>{pendingAction.user.firstName} {pendingAction.user.lastName}</strong>?
                  {pendingAction.type === "delete" && (
                    <span className="text-red-400 block mt-2">
                      This action cannot be undone.
                    </span>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="border-violet-600 text-violet-300 hover:bg-violet-950/20"
            >
              Cancel
            </Button>
            <Button
              className={pendingAction ? getActionColor(pendingAction.type) : ""}
              onClick={confirmAction}
            >
              Confirm {pendingAction?.type}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}