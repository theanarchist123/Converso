import { NextRequest, NextResponse } from 'next/server';
import { getRecentSessions } from '@/lib/actions/companion.actions';

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit') || '10');
        
        const recentSessions = await getRecentSessions(limit);
        
        return NextResponse.json({ 
            success: true, 
            data: recentSessions,
            count: recentSessions.length 
        });
    } catch (error) {
        console.error('Error fetching recent sessions:', error);
        return NextResponse.json({ 
            error: 'Failed to fetch recent sessions',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
