import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Get all users from companions table
    const { data: companionData, error: companionError } = await supabase
      .from('companions')
      .select('author, created_at')

    if (companionError) throw companionError

    // Get unique users with their signup date
    const usersMap = new Map()
    companionData?.forEach(row => {
      if (!usersMap.has(row.author) || new Date(row.created_at) < new Date(usersMap.get(row.author).signupDate)) {
        usersMap.set(row.author, {
          userId: row.author,
          signupDate: row.created_at
        })
      }
    })

    // Get all session history
    const { data: sessions, error: sessionError } = await supabase
      .from('session_history')
      .select('user_id, created_at')
      .order('created_at', { ascending: false })

    if (sessionError) throw sessionError

    // Get all companions created
    const { data: companions, error: companionsError } = await supabase
      .from('companions')
      .select('author, created_at')

    if (companionsError) throw companionsError

    const now = Date.now()
    const userRiskScores = []

    // Calculate risk score for each user
    usersMap.forEach((userData, userId) => {
      const userSessions = sessions?.filter(s => s.user_id === userId) || []
      const userCompanions = companions?.filter(c => c.author === userId) || []

      // Calculate days since signup
      const daysSinceSignup = Math.floor((now - new Date(userData.signupDate).getTime()) / (1000 * 60 * 60 * 24))

      // Calculate days since last activity
      let lastActivityDate = new Date(userData.signupDate)
      if (userSessions.length > 0) {
        const latestSession = userSessions.reduce((latest, session) => 
          new Date(session.created_at) > new Date(latest.created_at) ? session : latest
        )
        lastActivityDate = new Date(latestSession.created_at)
      }
      const daysSinceLastActivity = Math.floor((now - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))

      // Calculate activity metrics
      const totalSessions = userSessions.length
      const totalCompanions = userCompanions.length
      const avgSessionsPerWeek = daysSinceSignup > 0 
        ? (totalSessions / (daysSinceSignup / 7))
        : totalSessions

      // Calculate churn risk score (0-100, higher = more risk)
      let riskScore = 0

      // Inactivity penalty (max 40 points)
      if (daysSinceLastActivity > 30) riskScore += 40
      else if (daysSinceLastActivity > 14) riskScore += 30
      else if (daysSinceLastActivity > 7) riskScore += 20
      else if (daysSinceLastActivity > 3) riskScore += 10

      // Low engagement penalty (max 30 points)
      if (totalSessions === 0) riskScore += 30
      else if (totalSessions < 3) riskScore += 20
      else if (avgSessionsPerWeek < 1) riskScore += 15
      else if (avgSessionsPerWeek < 2) riskScore += 10

      // No companions created penalty (max 20 points)
      if (totalCompanions === 0) riskScore += 20
      else if (totalCompanions === 1) riskScore += 10

      // New user bonus (reduce risk for users less than 7 days old)
      if (daysSinceSignup < 7) {
        riskScore = Math.max(0, riskScore - 20)
      }

      // Determine risk level
      let riskLevel: 'critical' | 'high' | 'medium' | 'low'
      if (riskScore >= 70) riskLevel = 'critical'
      else if (riskScore >= 50) riskLevel = 'high'
      else if (riskScore >= 30) riskLevel = 'medium'
      else riskLevel = 'low'

      // Determine status
      let status: 'at-risk' | 'inactive' | 'active' | 'engaged'
      if (daysSinceLastActivity > 30) status = 'inactive'
      else if (riskScore >= 50) status = 'at-risk'
      else if (avgSessionsPerWeek >= 2) status = 'engaged'
      else status = 'active'

      // Generate recommendation
      let recommendation = ''
      if (daysSinceLastActivity > 14 && totalSessions > 0) {
        recommendation = 'Send re-engagement email with personalized content'
      } else if (totalCompanions === 0) {
        recommendation = 'Encourage to create their first AI companion'
      } else if (totalSessions < 3) {
        recommendation = 'Provide onboarding assistance and tips'
      } else if (avgSessionsPerWeek < 1) {
        recommendation = 'Send weekly learning reminders'
      } else {
        recommendation = 'User is engaged, continue current strategy'
      }

      userRiskScores.push({
        userId,
        signupDate: userData.signupDate,
        lastActivityDate: lastActivityDate.toISOString(),
        daysSinceLastActivity,
        daysSinceSignup,
        totalSessions,
        totalCompanions,
        avgSessionsPerWeek: Math.round(avgSessionsPerWeek * 10) / 10,
        riskScore: Math.min(100, riskScore),
        riskLevel,
        status,
        recommendation
      })
    })

    // Sort by risk score (highest first)
    userRiskScores.sort((a, b) => b.riskScore - a.riskScore)

    // Segment users
    const critical = userRiskScores.filter(u => u.riskLevel === 'critical')
    const high = userRiskScores.filter(u => u.riskLevel === 'high')
    const medium = userRiskScores.filter(u => u.riskLevel === 'medium')
    const low = userRiskScores.filter(u => u.riskLevel === 'low')

    const atRisk = userRiskScores.filter(u => u.status === 'at-risk')
    const inactive = userRiskScores.filter(u => u.status === 'inactive')

    // Calculate summary stats
    const totalUsers = userRiskScores.length
    const avgRiskScore = totalUsers > 0
      ? Math.round(userRiskScores.reduce((sum, u) => sum + u.riskScore, 0) / totalUsers)
      : 0

    return NextResponse.json({
      success: true,
      data: {
        users: userRiskScores,
        segments: {
          critical: critical.slice(0, 10), // Top 10 critical
          high: high.slice(0, 10),
          medium: medium.slice(0, 10),
          low: low.slice(0, 10),
          atRisk: atRisk.slice(0, 15), // Top 15 at risk
          inactive: inactive.slice(0, 15)
        },
        summary: {
          totalUsers,
          avgRiskScore,
          criticalCount: critical.length,
          highCount: high.length,
          mediumCount: medium.length,
          lowCount: low.length,
          atRiskCount: atRisk.length,
          inactiveCount: inactive.length,
          healthyRate: totalUsers > 0 ? Math.round((low.length / totalUsers) * 100) : 0,
          churnRate: totalUsers > 0 ? Math.round(((critical.length + high.length) / totalUsers) * 100) : 0
        }
      }
    })
  } catch (error) {
    console.error('Churn analysis error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate churn analysis',
        data: {
          users: [],
          segments: {},
          summary: {}
        }
      },
      { status: 500 }
    )
  }
}
