import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createSupabaseClient();
        
        // Use service role to bypass RLS since we're using Clerk for auth
        const { data: recaps, error } = await supabase
            .from('session_recaps')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching recaps:', error);
            return NextResponse.json({ error: 'Failed to fetch recaps' }, { status: 500 });
        }

        return NextResponse.json(recaps || []);

    } catch (error) {
        console.error('Error in recaps API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
