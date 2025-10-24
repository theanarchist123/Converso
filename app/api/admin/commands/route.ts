import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// In-memory storage for admin commands (resets on server restart)
// In production, you might want to use Redis or a database
let adminCommands: any[] = []

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return recent commands and clear them (polling pattern)
    const commands = [...adminCommands]
    adminCommands = [] // Clear after sending
    
    return NextResponse.json(commands)

  } catch (error) {
    console.error('❌ Admin commands poll error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { command, data, timestamp } = await request.json()

    if (!command) {
      return NextResponse.json({ error: 'Command is required' }, { status: 400 })
    }

    // Store command for polling
    const adminCommand = {
      id: Date.now().toString(),
      command,
      data,
      timestamp: timestamp || Date.now(),
      adminId: userId
    }

    adminCommands.push(adminCommand)
    console.log('📤 Admin command stored:', adminCommand)

    // Keep only last 50 commands to prevent memory issues
    if (adminCommands.length > 50) {
      adminCommands = adminCommands.slice(-50)
    }

    return NextResponse.json({
      success: true,
      message: 'Command queued successfully',
      commandId: adminCommand.id
    })

  } catch (error) {
    console.error('❌ Admin command error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}