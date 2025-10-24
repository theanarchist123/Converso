import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

// Helper function to create Supabase client with proper error handling
function createSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
  }

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = createSupabaseServiceClient()
    
    // Verify admin authentication
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // TODO: Add admin role verification here
    // For now, we'll assume the user is admin if they have a valid session

    const { userId: targetUserId, reason = 'Policy violation' } = await request.json()

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('🚫 Banning user via Supabase:', { targetUserId, reason, bannedBy: userId })

    // Call the ban_user function in Supabase
    const { data, error } = await supabase.rpc('ban_user', {
      target_user_id: targetUserId,
      reason: reason,
      banned_by_id: userId
    })

    if (error) {
      console.error('❌ Supabase ban_user error:', error)
      return NextResponse.json(
        { error: 'Failed to ban user', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ User banned successfully:', data)

    // The ban will automatically trigger Supabase Realtime notifications
    // which will be picked up by the BanListener component
    
    return NextResponse.json({
      success: true,
      message: `User ${targetUserId} has been banned`,
      data: data
    })

  } catch (error) {
    console.error('❌ Ban API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Create Supabase client  
    const supabase = createSupabaseServiceClient()
    
    // Verify admin authentication
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get('userId')

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('✅ Unbanning user via Supabase:', { targetUserId, unbannedBy: userId })

    // Call the unban_user function in Supabase
    const { data, error } = await supabase.rpc('unban_user', {
      target_user_id: targetUserId,
      unbanned_by_id: userId
    })

    if (error) {
      console.error('❌ Supabase unban_user error:', error)
      return NextResponse.json(
        { error: 'Failed to unban user', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ User unbanned successfully:', data)
    
    return NextResponse.json({
      success: true,
      message: `User ${targetUserId} has been unbanned`,
      data: data
    })

  } catch (error) {
    console.error('❌ Unban API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}