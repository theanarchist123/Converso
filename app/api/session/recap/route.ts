import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase';
import { generateSessionRecap } from '@/lib/gemini';
import type { RecapRequest, SessionRecap } from '@/types/messages';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { messages, companionName, subject, topic }: RecapRequest = await request.json();

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
        }

        // Generate recap using Gemini AI
        const recap = await generateSessionRecap(messages, companionName, subject, topic);

        // Save recap to database
        const supabase = createSupabaseClient();
        
        // Use service role to bypass RLS since we're using Clerk for auth
        const { data, error } = await supabase
            .from('session_recaps')
            .insert({
                user_id: userId,
                companion_name: companionName,
                subject,
                topic,
                bullet_points: recap.bullet_points,
                key_topics: recap.key_topics,
                summary: recap.summary,
                messages_count: messages.length
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving recap:', error);
            return NextResponse.json({ error: 'Failed to save recap' }, { status: 500 });
        }

        return NextResponse.json({
            id: data.id,
            bullet_points: recap.bullet_points,
            key_topics: recap.key_topics,
            summary: recap.summary,
            created_at: data.created_at
        });

    } catch (error) {
        console.error('Error generating recap:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
