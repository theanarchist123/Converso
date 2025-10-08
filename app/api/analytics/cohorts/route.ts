import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Fetch all users with their creation dates (from Clerk via companions/sessions)
    const { data: userData, error: userError } = await supabase
      .from('companions')
      .select('author, created_at')
      .order('created_at', { ascending: true })

    if (userError) throw userError

    // Get unique users with their first activity date
    const usersMap = new Map()
    userData?.forEach(row => {
      if (!usersMap.has(row.author) || new Date(row.created_at) < new Date(usersMap.get(row.author))) {
        usersMap.set(row.author, row.created_at)
      }
    })

    // Fetch all session history
    const { data: sessions, error: sessionError } = await supabase
      .from('session_history')
      .select('user_id, created_at')
      .order('created_at', { ascending: true })

    if (sessionError) throw sessionError

    // Calculate cohorts by signup month
    const cohorts = new Map()
    const now = new Date()

    usersMap.forEach((signupDate, userId) => {
      const cohortMonth = new Date(signupDate).toISOString().slice(0, 7) // YYYY-MM
      
      if (!cohorts.has(cohortMonth)) {
        cohorts.set(cohortMonth, {
          month: cohortMonth,
          size: 0,
          day1: 0,
          day7: 0,
          day30: 0,
          retention: {
            day1: 0,
            day7: 0,
            day30: 0
          }
        })
      }

      const cohort = cohorts.get(cohortMonth)
      cohort.size++

      // Calculate retention for this user
      const userSessions = sessions?.filter(s => s.user_id === userId) || []
      const signupTime = new Date(signupDate).getTime()

      const hasDay1Activity = userSessions.some(s => {
        const sessionTime = new Date(s.created_at).getTime()
        const daysDiff = (sessionTime - signupTime) / (1000 * 60 * 60 * 24)
        return daysDiff >= 1 && daysDiff < 2
      })

      const hasDay7Activity = userSessions.some(s => {
        const sessionTime = new Date(s.created_at).getTime()
        const daysDiff = (sessionTime - signupTime) / (1000 * 60 * 60 * 24)
        return daysDiff >= 7 && daysDiff < 14
      })

      const hasDay30Activity = userSessions.some(s => {
        const sessionTime = new Date(s.created_at).getTime()
        const daysDiff = (sessionTime - signupTime) / (1000 * 60 * 60 * 24)
        return daysDiff >= 30 && daysDiff < 60
      })

      if (hasDay1Activity) cohort.day1++
      if (hasDay7Activity) cohort.day7++
      if (hasDay30Activity) cohort.day30++
    })

    // Calculate retention percentages
    const cohortData = Array.from(cohorts.values()).map(cohort => ({
      ...cohort,
      retention: {
        day1: cohort.size > 0 ? Math.round((cohort.day1 / cohort.size) * 100) : 0,
        day7: cohort.size > 0 ? Math.round((cohort.day7 / cohort.size) * 100) : 0,
        day30: cohort.size > 0 ? Math.round((cohort.day30 / cohort.size) * 100) : 0
      }
    })).sort((a, b) => b.month.localeCompare(a.month))

    return NextResponse.json({
      success: true,
      data: cohortData.slice(0, 12) // Last 12 months
    })
  } catch (error) {
    console.error('Cohort analysis error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate cohort analysis',
        data: []
      },
      { status: 500 }
    )
  }
}
