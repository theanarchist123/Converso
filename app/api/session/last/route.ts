import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const companionId = searchParams.get('companionId');

        if (!companionId) {
            return NextResponse.json({ error: 'Companion ID is required' }, { status: 400 });
        }

        const supabase = createSupabaseClient();
        const { data, error } = await supabase
            .from("session_transcripts")
            .select("id, messages, created_at")
            .eq("user_id", user.id)
            .eq("companion_id", companionId)
            .order("created_at", { ascending: false })
            .limit(1);

        if (error) {
            console.error('Error fetching last session:', error);
            return NextResponse.json({ error: 'Failed to fetch last session' }, { status: 500 });
        }

        if (!data || data.length === 0) {
            return NextResponse.json({ 
                messages: [], 
                sessionId: null, 
                hasHistory: false 
            });
        }

        const session = data[0];
        return NextResponse.json({ 
            messages: session.messages || [], 
            sessionId: session.id,
            createdAt: session.created_at,
            hasHistory: true 
        });
    } catch (error) {
        console.error('Error fetching last session:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
