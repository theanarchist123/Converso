import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, subject, topic, voice, style, duration } = body;

        console.log('Creating companion with data:', { name, subject, topic, voice, style, duration, author: user.id });

        if (!name || !subject || !topic || !voice || !style) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = createSupabaseClient();
        
        const { data, error } = await supabase
            .from('companions')
            .insert({
                name,
                subject,
                topic,
                voice,
                style,
                duration: duration || 15,
                author: user.id,  // Use 'author' to match existing schema
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating companion:', error);
            return NextResponse.json({ error: 'Failed to create companion' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in create companion API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
