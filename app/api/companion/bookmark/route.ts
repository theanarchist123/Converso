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
        const { companionId, pathname } = body;

        const supabase = createSupabaseClient();
        
        const { data, error } = await supabase
            .from('bookmarks')
            .insert({
                companion_id: companionId,
                user_id: user.id,
                pathname: pathname || '/',
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding bookmark:', error);
            return NextResponse.json({ error: 'Failed to add bookmark' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in add bookmark API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
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
        
        const { error } = await supabase
            .from('bookmarks')
            .delete()
            .eq('companion_id', companionId)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error removing bookmark:', error);
            return NextResponse.json({ error: 'Failed to remove bookmark' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in remove bookmark API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
