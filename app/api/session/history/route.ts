import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET() {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('Fetching session history for user:', user.id);

        const supabase = createSupabaseClient();
        const { data, error } = await supabase
            .from("session_transcripts")
            .select(`
                id,
                companion_id,
                messages,
                created_at,
                companions(name)
            `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
        
        if (error) {
            console.error('Error fetching session transcripts:', error);
            return NextResponse.json({ error: `Failed to fetch session history: ${error.message}` }, { status: 500 });
        }

        console.log('Found sessions:', data?.length || 0);
        
        const sessions = (data || []).map(session => ({
            id: session.id,
            companion_id: session.companion_id,
            companion_name: (session.companions as any)?.name || 'Unknown Companion',
            messages: session.messages || [],
            created_at: session.created_at
        }));

        return NextResponse.json(sessions);
    } catch (error) {
        console.error('Error fetching session history:', error);
        return NextResponse.json({ error: 'Failed to fetch session history' }, { status: 500 });
    }
}
