import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminJWT } from '@/lib/jwt/auth'
import { clerkClient } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.replace(/^Bearer\s+/i, '')
    const admin = await verifyAdminJWT(token)
    
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, reason = 'Policy violation' } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    console.log('🔨 Admin ban initiated:', { userId, reason, admin: admin.userId })

    // Update Clerk user metadata (middleware will enforce ban)
    const clerk = await clerkClient()
    await clerk.users.updateUser(userId, {
      publicMetadata: { 
        status: 'banned', 
        bannedReason: reason,
        bannedAt: new Date().toISOString(),
        bannedBy: admin.userId
      }
    })

    // Insert ban event to Supabase to trigger realtime for the user's client
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { error: supabaseError } = await supabase
      .from('user_status')
      .insert({
        user_id: userId,
        status: 'banned',
        reason,
        source: 'admin_panel',
        created_at: new Date().toISOString()
      })

    if (supabaseError) {
      console.error('⚠️ Supabase status insert failed:', supabaseError)
      // Still return success since Clerk metadata is updated
    }

    console.log('✅ User banned successfully:', userId)

    return NextResponse.json({
      success: true,
      data: { 
        userId, 
        reason,
        bannedAt: new Date().toISOString()
      }
    })
  } catch (e: any) {
    console.error('❌ Admin ban error:', e)
    return NextResponse.json({ 
      error: e?.message || 'Failed to ban user' 
    }, { status: 500 })
  }
}
