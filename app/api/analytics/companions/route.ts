import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Get all companions with their stats
    const { data: companions, error: companionError } = await supabase
      .from('companions')
      .select('id, name, subject, topic, author, created_at')

    if (companionError) throw companionError

    // Get session counts for each companion
    const { data: sessions, error: sessionError } = await supabase
      .from('session_history')
      .select('companion_id, user_id, created_at')

    if (sessionError) throw sessionError

    // Get transcript data for engagement metrics
    const { data: transcripts, error: transcriptError } = await supabase
      .from('session_transcripts')
      .select('companion_id, messages, created_at')

    if (transcriptError) throw transcriptError

    // Calculate stats for each companion
    const companionStats = companions?.map(companion => {
      const companionSessions = sessions?.filter(s => s.companion_id === companion.id) || []
      const companionTranscripts = transcripts?.filter(t => t.companion_id === companion.id) || []
      
      const totalSessions = companionSessions.length
      const uniqueUsers = new Set(companionSessions.map(s => s.user_id)).size
      
      // Calculate average session length (messages count)
      const avgMessages = companionTranscripts.length > 0
        ? Math.round(
            companionTranscripts.reduce((sum, t) => {
              try {
                const messages = typeof t.messages === 'string' ? JSON.parse(t.messages) : t.messages
                return sum + (Array.isArray(messages) ? messages.length : 0)
              } catch {
                return sum
              }
            }, 0) / companionTranscripts.length
          )
        : 0

      // Calculate retention (users who came back for 2nd session)
      const userSessionCounts = new Map()
      companionSessions.forEach(s => {
        userSessionCounts.set(s.user_id, (userSessionCounts.get(s.user_id) || 0) + 1)
      })
      const returningUsers = Array.from(userSessionCounts.values()).filter(count => count > 1).length
      const retentionRate = uniqueUsers > 0 ? Math.round((returningUsers / uniqueUsers) * 100) : 0

      // Calculate engagement score (0-100)
      const engagementScore = Math.min(
        100,
        Math.round(
          (totalSessions * 20) +
          (uniqueUsers * 15) +
          (avgMessages * 3) +
          (retentionRate * 0.5)
        )
      )

      // Days since creation
      const daysSinceCreation = Math.floor(
        (Date.now() - new Date(companion.created_at).getTime()) / (1000 * 60 * 60 * 24)
      )

      // Performance category
      let performance: 'high' | 'medium' | 'low'
      if (engagementScore >= 70) performance = 'high'
      else if (engagementScore >= 40) performance = 'medium'
      else performance = 'low'

      return {
        id: companion.id,
        name: companion.name,
        subject: companion.subject,
        topic: companion.topic,
        totalSessions,
        uniqueUsers,
        avgSessionLength: avgMessages,
        retentionRate,
        engagementScore,
        performance,
        createdAt: companion.created_at,
        daysSinceCreation,
        lastUsed: companionSessions.length > 0
          ? companionSessions[companionSessions.length - 1].created_at
          : companion.created_at
      }
    }) || []

    // Sort by engagement score
    companionStats.sort((a, b) => b.engagementScore - a.engagementScore)

    // Get top performers (top 5)
    const topPerformers = companionStats.slice(0, 5)

    // Get underperformers (low engagement and old)
    const underperformers = companionStats
      .filter(c => c.performance === 'low' && c.daysSinceCreation > 7)
      .slice(0, 5)

    // Get trending (recent and high engagement)
    const trending = companionStats
      .filter(c => c.daysSinceCreation <= 30 && c.engagementScore >= 50)
      .slice(0, 5)

    // Calculate overall stats
    const totalCompanions = companionStats.length
    const avgEngagement = totalCompanions > 0
      ? Math.round(companionStats.reduce((sum, c) => sum + c.engagementScore, 0) / totalCompanions)
      : 0
    const totalSessions = companionStats.reduce((sum, c) => sum + c.totalSessions, 0)
    const avgSessionsPerCompanion = totalCompanions > 0
      ? Math.round(totalSessions / totalCompanions)
      : 0

    return NextResponse.json({
      success: true,
      data: {
        topPerformers,
        underperformers,
        trending,
        allCompanions: companionStats,
        summary: {
          totalCompanions,
          avgEngagement,
          totalSessions,
          avgSessionsPerCompanion,
          highPerformers: companionStats.filter(c => c.performance === 'high').length,
          mediumPerformers: companionStats.filter(c => c.performance === 'medium').length,
          lowPerformers: companionStats.filter(c => c.performance === 'low').length
        }
      }
    })
  } catch (error) {
    console.error('Companion intelligence error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate companion analytics',
        data: {
          topPerformers: [],
          underperformers: [],
          trending: [],
          allCompanions: [],
          summary: {}
        }
      },
      { status: 500 }
    )
  }
}
