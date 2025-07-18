import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase';
import { addToSessionHistory } from '@/lib/actions/companion.actions';
import type { SavedMessage } from '@/types/messages';

export async function POST(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { companionId, messages }: { companionId: string; messages: SavedMessage[] } = await request.json();
        
        if (!companionId || !messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
        }

        console.log('Saving session for user:', user.id, 'companion:', companionId, 'messages count:', messages.length);

        const supabase = createSupabaseClient();
        const { data, error } = await supabase
            .from("session_transcripts")
            .insert({
                user_id: user.id,  // This should be a TEXT field for Clerk user IDs
                companion_id: companionId,
                messages: messages
            })
            .select();
        
        if (error) {
            console.error('Error saving session transcript:', error);
            return NextResponse.json({ error: `Failed to save session: ${error.message}` }, { status: 500 });
        }

        // Also add to session history for recent sessions tracking
        try {
            await addToSessionHistory(companionId);
        } catch (historyError) {
            console.error('Error adding to session history:', historyError);
            // Don't fail the request if history fails, just log it
        }

        console.log('Session saved successfully:', data);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error saving session:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
