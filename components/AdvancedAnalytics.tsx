'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Brain,
  Zap,
  Activity,
  Clock,
  Award,
  Filter,
  Calendar,
  BarChart3
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface CohortData {
  cohortName: string
  size: number
  d1Retention: number
  d7Retention: number
  d30Retention: number
  avgSessions: number
  trend: 'up' | 'down' | 'stable'
}

interface FunnelStep {
  name: string
  users: number
  dropOff: number
  conversionRate: number
}

interface CompanionStats {
  id: string
  name: string
  subject: string
  totalSessions: number
  avgSessionLength: number
  retentionImpact: number
  userRating: number
  status: 'top' | 'average' | 'underperforming'
}

interface ChurnRiskUser {
  id: string
  name: string
  email: string
  lastActive: string
  riskScore: number
  riskLevel: 'high' | 'medium' | 'low'
  daysSinceLastSession: number
  sessionsTotal: number
}

export default function AdvancedAnalytics() {
  const [activeTab, setActiveTab] = useState('cohorts')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Real data states - initialized as empty, will be populated from API
  const [cohorts, setCohorts] = useState<CohortData[]>([])

  const [funnelSteps, setFunnelSteps] = useState<FunnelStep[]>([])

  const [companions, setCompanions] = useState<CompanionStats[]>([])

  const [churnRiskUsers, setChurnRiskUsers] = useState<ChurnRiskUser[]>([])

  const [funnelData, setFunnelData] = useState<any>(null)
  const [companionData, setCompanionData] = useState<any>(null)
  const [churnData, setChurnData] = useState<any>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch all analytics data in parallel
        const [cohortsRes, funnelRes, companionsRes, churnRes] = await Promise.all([
          fetch('/api/analytics/cohorts'),
          fetch('/api/analytics/funnel'),
          fetch('/api/analytics/companions'),
          fetch('/api/analytics/churn')
        ])

        console.log('🔍 API Response Status:', {
          cohorts: cohortsRes.status,
          funnel: funnelRes.status,
          companions: companionsRes.status,
          churn: churnRes.status
        })

        const cohortsData = await cohortsRes.json()
        const funnelDataRes = await funnelRes.json()
        const companionsDataRes = await companionsRes.json()
        const churnDataRes = await churnRes.json()

        console.log('📊 API Data Received:', {
          cohorts: cohortsData,
          funnel: funnelDataRes,
          companions: companionsDataRes,
          churn: churnDataRes
        })

        // Transform cohorts data
        if (cohortsData.success && cohortsData.data.length > 0) {
          const transformedCohorts = cohortsData.data.map((cohort: any) => ({
            cohortName: new Date(cohort.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            size: cohort.size,
            d1Retention: cohort.retention.day1,
            d7Retention: cohort.retention.day7,
            d30Retention: cohort.retention.day30,
            avgSessions: Math.round((cohort.day1 + cohort.day7 + cohort.day30) / 3) || 0,
            trend: cohort.retention.day7 > 50 ? 'up' : cohort.retention.day7 > 30 ? 'stable' : 'down'
          }))
          console.log('✅ Cohorts transformed:', transformedCohorts)
          setCohorts(transformedCohorts)
        }

        // Store and transform funnel data
        if (funnelDataRes.success && funnelDataRes.data.funnel) {
          console.log('📊 Funnel data received:', funnelDataRes.data)
          setFunnelData(funnelDataRes.data)
          // Transform funnel data to match UI structure
          const transformedFunnel = funnelDataRes.data.funnel.map((stage: any, index: number) => ({
            name: stage.stage,
            users: stage.users,
            dropOff: stage.dropOff,
            conversionRate: stage.percentage
          }))
          console.log('✅ Funnel transformed:', transformedFunnel)
          setFunnelSteps(transformedFunnel)
        } else {
          console.log('⚠️ Funnel data check failed:', {
            success: funnelDataRes.success,
            hasFunnel: funnelDataRes.data?.funnel ? 'yes' : 'no',
            fullData: funnelDataRes
          })
        }

        // Store and transform companion data
        if (companionsDataRes.success && companionsDataRes.data) {
          console.log('📊 Companion data received:', companionsDataRes.data)
          setCompanionData(companionsDataRes.data)
          // Transform companion data to match UI structure
          const allCompanionsList = [
            ...companionsDataRes.data.topPerformers.map((c: any) => ({
              id: c.id,
              name: c.name,
              subject: c.subject || 'General',
              totalSessions: c.totalSessions,
              avgSessionLength: c.avgSessionLength,
              retentionImpact: c.retentionRate,
              userRating: c.engagementScore / 20, // Convert 0-100 to 0-5 scale
              status: 'top' as const
            })),
            ...companionsDataRes.data.underperformers.map((c: any) => ({
              id: c.id,
              name: c.name,
              subject: c.subject || 'General',
              totalSessions: c.totalSessions,
              avgSessionLength: c.avgSessionLength,
              retentionImpact: c.retentionRate,
              userRating: c.engagementScore / 20,
              status: 'underperforming' as const
            })),
            ...companionsDataRes.data.trending.map((c: any) => ({
              id: c.id,
              name: c.name,
              subject: c.subject || 'General',
              totalSessions: c.totalSessions,
              avgSessionLength: c.avgSessionLength,
              retentionImpact: c.retentionRate,
              userRating: c.engagementScore / 20,
              status: 'average' as const
            }))
          ]
          console.log('✅ Companions transformed:', allCompanionsList)
          setCompanions(allCompanionsList)
        } else {
          console.log('⚠️ Companion data check failed:', {
            success: companionsDataRes.success,
            hasData: companionsDataRes.data ? 'yes' : 'no',
            fullData: companionsDataRes
          })
        }

        // Store and transform churn data
        if (churnDataRes.success && churnDataRes.data && Array.isArray(churnDataRes.data.users)) {
          console.log('📊 Churn data received:', churnDataRes.data)
          setChurnData(churnDataRes.data)
          // Transform churn data to match UI structure
          const transformedChurnUsers = churnDataRes.data.users.slice(0, 20).map((user: any) => {
            // Safely access nested properties with fallbacks
            const dates = user.dates || {}
            const metrics = user.metrics || {}
            const lastSession = dates.lastSession || dates.lastActivity || new Date().toISOString()
            
            return {
              id: user.userId || 'unknown',
              name: user.userId || 'Unknown User',
              email: `${user.userId || 'unknown'}@user.com`,
              lastActive: new Date(lastSession).toISOString().split('T')[0],
              riskScore: user.riskScore || 0,
              riskLevel: user.riskLevel || 'low',
              daysSinceLastSession: metrics.daysSinceLastActivity || 0,
              sessionsTotal: metrics.totalSessions || 0
            }
          })
          console.log('✅ Churn users transformed:', transformedChurnUsers)
          setChurnRiskUsers(transformedChurnUsers)
        } else {
          console.log('⚠️ Churn data check failed:', {
            success: churnDataRes.success,
            hasUsers: churnDataRes.data?.users ? 'yes' : 'no',
            fullData: churnDataRes
          })
        }

      } catch (err) {
        console.error('❌ Analytics fetch error:', err)
        setError('Failed to load analytics data. Using demo data.')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  const getRiskBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical':
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500'
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'top': return 'bg-green-500/20 text-green-400 border-green-500'
      case 'average': return 'bg-blue-500/20 text-blue-400 border-blue-500'
      case 'underperforming': return 'bg-red-500/20 text-red-400 border-red-500'
      default: return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-violet-300 flex items-center gap-3">
            <Brain className="h-8 w-8" />
            Advanced Analytics Hub
          </h2>
          <p className="text-violet-400 mt-1">Deep insights into user behavior, engagement, and platform health</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-violet-500/20 text-violet-300 border-violet-500">
            <Activity className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-black border border-violet-600">
          <TabsTrigger value="cohorts" className="data-[state=active]:bg-violet-600/20 data-[state=active]:text-violet-300">
            <Users className="h-4 w-4 mr-2" />
            Cohort Analysis
          </TabsTrigger>
          <TabsTrigger value="funnel" className="data-[state=active]:bg-violet-600/20 data-[state=active]:text-violet-300">
            <Filter className="h-4 w-4 mr-2" />
            Engagement Funnel
          </TabsTrigger>
          <TabsTrigger value="companions" className="data-[state=active]:bg-violet-600/20 data-[state=active]:text-violet-300">
            <Award className="h-4 w-4 mr-2" />
            Companion Intel
          </TabsTrigger>
          <TabsTrigger value="churn" className="data-[state=active]:bg-violet-600/20 data-[state=active]:text-violet-300">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Churn Radar
          </TabsTrigger>
        </TabsList>

        {/* Cohort & Retention Explorer */}
        <TabsContent value="cohorts" className="space-y-4">
          <Card className="bg-black border-violet-600">
            <CardHeader>
              <CardTitle className="text-violet-300 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                User Cohorts & Retention
              </CardTitle>
              <CardDescription className="text-violet-400">
                Track how different user groups perform over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-violet-300">Loading cohort data...</div>
                </div>
              ) : cohorts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-12 w-12 text-violet-400 mb-4" />
                  <p className="text-violet-300 font-medium">No Cohort Data Available</p>
                  <p className="text-violet-500 text-sm mt-2">Data will appear once users sign up and engage</p>
                </div>
              ) : (
                <>
              <Table>
                <TableHeader>
                  <TableRow className="border-violet-600 hover:bg-violet-950/20">
                    <TableHead className="text-violet-300">Cohort</TableHead>
                    <TableHead className="text-violet-300">Size</TableHead>
                    <TableHead className="text-violet-300">D1 Retention</TableHead>
                    <TableHead className="text-violet-300">D7 Retention</TableHead>
                    <TableHead className="text-violet-300">D30 Retention</TableHead>
                    <TableHead className="text-violet-300">Avg Sessions</TableHead>
                    <TableHead className="text-violet-300">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cohorts.map((cohort, index) => (
                    <TableRow key={index} className="border-violet-600 hover:bg-violet-950/20">
                      <TableCell className="font-medium text-white">{cohort.cohortName}</TableCell>
                      <TableCell className="text-violet-300">{cohort.size}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={cohort.d1Retention} className="w-16" />
                          <span className="text-violet-300 text-sm">{cohort.d1Retention}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={cohort.d7Retention} className="w-16" />
                          <span className="text-violet-300 text-sm">{cohort.d7Retention}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={cohort.d30Retention} className="w-16" />
                          <span className="text-violet-300 text-sm">{cohort.d30Retention}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-violet-300">{cohort.avgSessions}</TableCell>
                      <TableCell>
                        {cohort.trend === 'up' && <TrendingUp className="h-5 w-5 text-green-400" />}
                        {cohort.trend === 'down' && <TrendingDown className="h-5 w-5 text-red-400" />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <Card className="bg-violet-950/20 border-violet-600">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-violet-400">Avg D1 Retention</p>
                        <p className="text-2xl font-bold text-white">68.3%</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-violet-950/20 border-violet-600">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-violet-400">Avg D7 Retention</p>
                        <p className="text-2xl font-bold text-white">45.0%</p>
                      </div>
                      <Activity className="h-8 w-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-violet-950/20 border-violet-600">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-violet-400">Avg D30 Retention</p>
                        <p className="text-2xl font-bold text-white">28.3%</p>
                      </div>
                      <Target className="h-8 w-8 text-violet-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engagement Funnel */}
        <TabsContent value="funnel" className="space-y-4">
          <Card className="bg-black border-violet-600">
            <CardHeader>
              <CardTitle className="text-violet-300 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                User Engagement Funnel
              </CardTitle>
              <CardDescription className="text-violet-400">
                Analyze user journey and identify drop-off points
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-violet-300">Loading funnel data...</div>
                </div>
              ) : funnelSteps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Filter className="h-12 w-12 text-violet-400 mb-4" />
                  <p className="text-violet-300 font-medium">No Funnel Data Available</p>
                  <p className="text-violet-500 text-sm mt-2">Data will appear once users start using the platform</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {funnelSteps.map((step, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          step.conversionRate >= 80 ? 'bg-green-500/20 text-green-400' :
                          step.conversionRate >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-white font-medium">{step.name}</p>
                          <p className="text-sm text-violet-400">
                            {step.users.toLocaleString()} users
                            {index > 0 && ` • ${step.dropOff.toLocaleString()} dropped off`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={
                          step.conversionRate >= 80 ? 'bg-green-500/20 text-green-400 border-green-500' :
                          step.conversionRate >= 60 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500' :
                          'bg-red-500/20 text-red-400 border-red-500'
                        }>
                          {step.conversionRate}% conversion
                        </Badge>
                      </div>
                    </div>
                    <Progress value={(step.users / funnelSteps[0].users) * 100} className="h-3" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <Card className="bg-red-950/20 border-red-600">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-400">Biggest Drop-Off</p>
                        <p className="text-lg font-bold text-white">
                          {funnelData?.summary?.biggestDropOff?.stage || 'Completed → Feedback'}
                        </p>
                        <p className="text-sm text-red-300">
                          {funnelData?.summary?.biggestDropOff?.dropOff || 60}% drop-off rate
                        </p>
                      </div>
                      <XCircle className="h-8 w-8 text-red-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-green-950/20 border-green-600">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-400">Total Users</p>
                        <p className="text-lg font-bold text-white">
                          {funnelData?.summary?.totalUsers?.toLocaleString() || '2,500'}
                        </p>
                        <p className="text-sm text-green-300">
                          {funnelData?.summary?.overallConversion || 14}% overall conversion
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Companion Intelligence */}
        <TabsContent value="companions" className="space-y-4">
          <Card className="bg-black border-violet-600">
            <CardHeader>
              <CardTitle className="text-violet-300 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Companion Performance Intelligence
              </CardTitle>
              <CardDescription className="text-violet-400">
                Analyze which AI companions drive the most engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-violet-300">Loading companion data...</div>
                </div>
              ) : companions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Award className="h-12 w-12 text-violet-400 mb-4" />
                  <p className="text-violet-300 font-medium">No Companion Data Available</p>
                  <p className="text-violet-500 text-sm mt-2">Data will appear once companions are created and used</p>
                </div>
              ) : (
                <>
              <Table>
                <TableHeader>
                  <TableRow className="border-violet-600 hover:bg-violet-950/20">
                    <TableHead className="text-violet-300">Companion</TableHead>
                    <TableHead className="text-violet-300">Subject</TableHead>
                    <TableHead className="text-violet-300">Total Sessions</TableHead>
                    <TableHead className="text-violet-300">Avg Length (min)</TableHead>
                    <TableHead className="text-violet-300">Retention Impact</TableHead>
                    <TableHead className="text-violet-300">Rating</TableHead>
                    <TableHead className="text-violet-300">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companions.map((companion) => (
                    <TableRow key={companion.id} className="border-violet-600 hover:bg-violet-950/20">
                      <TableCell className="font-medium text-white">{companion.name}</TableCell>
                      <TableCell className="text-violet-300">{companion.subject}</TableCell>
                      <TableCell className="text-violet-300">{companion.totalSessions}</TableCell>
                      <TableCell className="text-violet-300">{companion.avgSessionLength}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={companion.retentionImpact} className="w-16" />
                          <span className="text-violet-300 text-sm">{companion.retentionImpact}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">★</span>
                          <span className="text-white">{companion.userRating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(companion.status)}>
                          {companion.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <Card className="bg-green-950/20 border-green-600">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-400">Top Performers</p>
                        <p className="text-2xl font-bold text-white">
                          {companionData?.summary?.highPerformers || 0}
                        </p>
                        <p className="text-sm text-green-300">High engagement</p>
                      </div>
                      <Zap className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-blue-950/20 border-blue-600">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-400">Average</p>
                        <p className="text-2xl font-bold text-white">
                          {companionData?.summary?.mediumPerformers || 0}
                        </p>
                        <p className="text-sm text-blue-300">Medium engagement</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-red-950/20 border-red-600">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-400">Underperforming</p>
                        <p className="text-2xl font-bold text-white">
                          {companionData?.summary?.lowPerformers || 0}
                        </p>
                        <p className="text-sm text-red-300">Low engagement</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Churn & Risk Radar */}
        <TabsContent value="churn" className="space-y-4">
          <Card className="bg-black border-violet-600">
            <CardHeader>
              <CardTitle className="text-violet-300 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Churn Risk Radar
              </CardTitle>
              <CardDescription className="text-violet-400">
                Identify and re-engage users at risk of churning
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-violet-300">Loading churn data...</div>
                </div>
              ) : churnRiskUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertTriangle className="h-12 w-12 text-violet-400 mb-4" />
                  <p className="text-violet-300 font-medium">No Churn Data Available</p>
                  <p className="text-violet-500 text-sm mt-2">Data will appear once users are active on the platform</p>
                </div>
              ) : (
                <>
              <Table>
                <TableHeader>
                  <TableRow className="border-violet-600 hover:bg-violet-950/20">
                    <TableHead className="text-violet-300">User</TableHead>
                    <TableHead className="text-violet-300">Last Active</TableHead>
                    <TableHead className="text-violet-300">Days Inactive</TableHead>
                    <TableHead className="text-violet-300">Total Sessions</TableHead>
                    <TableHead className="text-violet-300">Risk Score</TableHead>
                    <TableHead className="text-violet-300">Risk Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {churnRiskUsers.map((user) => (
                    <TableRow key={user.id} className="border-violet-600 hover:bg-violet-950/20">
                      <TableCell>
                        <div>
                          <p className="font-medium text-white">{user.name}</p>
                          <p className="text-sm text-violet-400">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-violet-300">{user.lastActive}</TableCell>
                      <TableCell className="text-violet-300">{user.daysSinceLastSession} days</TableCell>
                      <TableCell className="text-violet-300">{user.sessionsTotal}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={user.riskScore} className="w-16" />
                          <span className="text-violet-300 text-sm">{user.riskScore}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRiskBadgeColor(user.riskLevel)}>
                          {user.riskLevel.toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <Card className="bg-red-950/20 border-red-600">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-400">Critical Risk</p>
                        <p className="text-2xl font-bold text-white">
                          {churnData?.summary?.criticalCount || 0}
                        </p>
                        <p className="text-sm text-red-300">≥70 score</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-yellow-950/20 border-yellow-600">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-400">High Risk</p>
                        <p className="text-2xl font-bold text-white">
                          {churnData?.summary?.highCount || 0}
                        </p>
                        <p className="text-sm text-yellow-300">50-69 score</p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-green-950/20 border-green-600">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-400">Healthy Users</p>
                        <p className="text-2xl font-bold text-white">
                          {churnData?.summary?.lowCount || 0}
                        </p>
                        <p className="text-sm text-green-300">
                          {churnData?.summary?.healthyRate || 0}% healthy
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
