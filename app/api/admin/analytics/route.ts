import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminJWT } from '@/lib/jwt/auth';
import { clerkClient } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminData = verifyAdminJWT(request);

    if (!adminData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!adminData.permissions?.includes('view_analytics')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get basic analytics data from Clerk
    const clerk = await clerkClient();
    const users = await clerk.users.getUserList({ limit: 1 });
    const totalUsers = users.totalCount || 0;

    // Generate mock analytics data for demo
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().split('T')[0],
        users: Math.floor(Math.random() * 20) + 5,
        sessions: Math.floor(Math.random() * 50) + 10
      };
    }).reverse();

    const analytics = {
      overview: {
        totalUsers,
        totalSessions: Math.floor(totalUsers * 3.2),
        averageSessionTime: '12 minutes',
        activeUsersToday: Math.floor(totalUsers * 0.15)
      },
      userGrowth: last7Days,
      topMetrics: {
        mostActiveHour: '2:00 PM - 3:00 PM',
        popularFeatures: [
          { name: 'AI Companions', usage: '85%' },
          { name: 'Bookmarks', usage: '67%' },
          { name: 'Progress Tracking', usage: '52%' }
        ],
        retentionRate: '78%'
      },
      recentActivity: [
        { action: 'New user registered', time: '5 minutes ago', user: 'user-123' },
        { action: 'Companion created', time: '12 minutes ago', user: 'user-456' },
        { action: 'Session completed', time: '18 minutes ago', user: 'user-789' },
        { action: 'Feedback submitted', time: '25 minutes ago', user: 'user-321' }
      ]
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}