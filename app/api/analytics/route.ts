import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectMongoDB from '@/lib/mongodb/connection';
import UserAnalytics from '@/lib/mongodb/models/UserAnalytics';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongoDB();
    
    const body = await request.json();
    const { eventType, eventData = {} } = body;
    
    // Validate event type
    const validEvents = ['page_view', 'companion_created', 'session_started', 'session_ended', 'bookmark_added', 'learning_log_created'];
    if (!validEvents.includes(eventType)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }
    
    // Get user agent and IP for basic tracking
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    // Create analytics entry
    const analytics = new UserAnalytics({
      userId,
      eventType,
      eventData,
      userAgent,
      ipAddress
    });
    
    await analytics.save();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json({ 
      error: 'Failed to track event' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongoDB();
    
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const eventType = searchParams.get('eventType');
    
    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Build query
    const query: any = { 
      userId,
      createdAt: { $gte: startDate }
    };
    if (eventType) query.eventType = eventType;
    
    // Get analytics data
    const analytics = await UserAnalytics.find(query)
      .sort({ createdAt: -1 })
      .limit(1000)
      .lean();
    
    // Simple aggregations
    const eventCounts = analytics.reduce((acc: any, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {});
    
    const dailyActivity = analytics.reduce((acc: any, event) => {
      const date = new Date(event.createdAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    return NextResponse.json({
      success: true,
      data: {
        totalEvents: analytics.length,
        eventCounts,
        dailyActivity,
        recentEvents: analytics.slice(0, 20)
      }
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch analytics' 
    }, { status: 500 });
  }
}