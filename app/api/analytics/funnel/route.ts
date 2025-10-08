import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Get total unique visitors (users who created companions or sessions)
    const { data: companionUsers, error: companionError } = await supabase
      .from('companions')
      .select('author')
    
    const { data: sessionUsers, error: sessionError } = await supabase
      .from('session_history')
      .select('user_id')

    if (companionError || sessionError) {
      throw companionError || sessionError
    }

    const allUsers = new Set([
      ...(companionUsers?.map(c => c.author) || []),
      ...(sessionUsers?.map(s => s.user_id) || [])
    ])

    const totalVisitors = allUsers.size

    // Users who created at least one companion
    const { data: companionCreators, error: creatorError } = await supabase
      .from('companions')
      .select('author')

    if (creatorError) throw creatorError

    const uniqueCreators = new Set(companionCreators?.map(c => c.author) || [])
    const companionCreated = uniqueCreators.size

    // Users who started at least one session
    const { data: sessionStarters, error: starterError } = await supabase
      .from('session_history')
      .select('user_id')

    if (starterError) throw starterError

    const uniqueSessionStarters = new Set(sessionStarters?.map(s => s.user_id) || [])
    const sessionStarted = uniqueSessionStarters.size

    // Users who completed sessions (have session_transcripts with messages)
    const { data: transcripts, error: transcriptError } = await supabase
      .from('session_transcripts')
      .select('user_id, messages')

    if (transcriptError) throw transcriptError

    const completedUsers = new Set(
      transcripts?.filter(t => {
        try {
          const messages = typeof t.messages === 'string' ? JSON.parse(t.messages) : t.messages
          return Array.isArray(messages) && messages.length >= 3 // At least 3 messages = completed
        } catch {
          return false
        }
      }).map(t => t.user_id) || []
    )
    const sessionCompleted = completedUsers.size

    // Users who left feedback (have session_recaps)
    const { data: recaps, error: recapError } = await supabase
      .from('session_recaps')
      .select('user_id')

    if (recapError) throw recapError

    const feedbackUsers = new Set(recaps?.map(r => r.user_id) || [])
    const feedbackLeft = feedbackUsers.size

    // Calculate conversion rates
    const companionRate = totalVisitors > 0 ? Math.round((companionCreated / totalVisitors) * 100) : 0
    const sessionRate = companionCreated > 0 ? Math.round((sessionStarted / companionCreated) * 100) : 0
    const completionRate = sessionStarted > 0 ? Math.round((sessionCompleted / sessionStarted) * 100) : 0
    const feedbackRate = sessionCompleted > 0 ? Math.round((feedbackLeft / sessionCompleted) * 100) : 0

    const funnelData = [
      {
        stage: 'Visitors',
        users: totalVisitors,
        percentage: 100,
        dropOff: 0,
        description: 'Total unique users who interacted with the platform'
      },
      {
        stage: 'Created Companion',
        users: companionCreated,
        percentage: companionRate,
        dropOff: totalVisitors > 0 ? Math.round(((totalVisitors - companionCreated) / totalVisitors) * 100) : 0,
        description: 'Users who created at least one AI companion'
      },
      {
        stage: 'Started Session',
        users: sessionStarted,
        percentage: sessionRate,
        dropOff: companionCreated > 0 ? Math.round(((companionCreated - sessionStarted) / companionCreated) * 100) : 0,
        description: 'Users who initiated a learning session'
      },
      {
        stage: 'Completed Session',
        users: sessionCompleted,
        percentage: completionRate,
        dropOff: sessionStarted > 0 ? Math.round(((sessionStarted - sessionCompleted) / sessionStarted) * 100) : 0,
        description: 'Users who completed a full session (3+ messages)'
      },
      {
        stage: 'Left Feedback',
        users: feedbackLeft,
        percentage: feedbackRate,
        dropOff: sessionCompleted > 0 ? Math.round(((sessionCompleted - feedbackLeft) / sessionCompleted) * 100) : 0,
        description: 'Users who provided session feedback/recap'
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        funnel: funnelData,
        summary: {
          totalUsers: totalVisitors,
          overallConversion: totalVisitors > 0 ? Math.round((feedbackLeft / totalVisitors) * 100) : 0,
          biggestDropOff: funnelData.reduce((max, stage) => stage.dropOff > max.dropOff ? stage : max, funnelData[0])
        }
      }
    })
  } catch (error) {
    console.error('Funnel analysis error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate funnel analysis',
        data: { funnel: [], summary: {} }
      },
      { status: 500 }
    )
  }
}
