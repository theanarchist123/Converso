import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createSupabaseClient();

        // First, create session_history table if it doesn't exist
        const { error: createError } = await supabase.rpc('exec', {
            sql: `
                CREATE TABLE IF NOT EXISTS session_history (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id TEXT NOT NULL,
                    companion_id UUID NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    
                    CONSTRAINT fk_session_history_companion
                        FOREIGN KEY (companion_id) 
                        REFERENCES companions(id)
                        ON DELETE CASCADE
                );
                
                CREATE INDEX IF NOT EXISTS idx_session_history_user_id ON session_history(user_id);
                CREATE INDEX IF NOT EXISTS idx_session_history_companion_id ON session_history(companion_id);
                CREATE INDEX IF NOT EXISTS idx_session_history_created_at ON session_history(created_at DESC);
                
                ALTER TABLE session_history DISABLE ROW LEVEL SECURITY;
            `
        });

        if (createError) {
            console.error('Error creating session_history table:', createError);
        }

        // Populate session_history from existing session_transcripts
        const { data: populated, error: populateError } = await supabase.rpc('exec', {
            sql: `
                INSERT INTO session_history (user_id, companion_id, created_at)
                SELECT DISTINCT ON (user_id, companion_id, DATE(created_at))
                    user_id, 
                    companion_id, 
                    created_at
                FROM session_transcripts
                WHERE companion_id IS NOT NULL
                ORDER BY user_id, companion_id, DATE(created_at), created_at DESC;
            `
        });

        if (populateError) {
            console.error('Error populating session_history:', populateError);
            return NextResponse.json({ error: 'Failed to populate session history' }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Session history table created and populated successfully'
        });
    } catch (error) {
        console.error('Error setting up session history:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
