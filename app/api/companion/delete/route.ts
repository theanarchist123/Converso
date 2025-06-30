import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function DELETE(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const companionId = searchParams.get('id');

        if (!companionId) {
            return NextResponse.json({ error: 'Companion ID is required' }, { status: 400 });
        }

        const supabase = createSupabaseClient();
        
        // First verify the companion belongs to the user
        const { data: companion, error: fetchError } = await supabase
            .from('companions')
            .select('author')  // Changed from 'user_id' to 'author'
            .eq('id', companionId)
            .single();

        if (fetchError || !companion) {
            console.error('Error fetching companion:', fetchError);
            return NextResponse.json({ error: 'Companion not found' }, { status: 404 });
        }

        if (companion.author !== user.id) {  // Changed from 'user_id' to 'author'
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        console.log('Deleting companion:', companionId, 'for user:', user.id);

        // Delete the companion
        const { error } = await supabase
            .from('companions')
            .delete()
            .eq('id', companionId)
            .eq('author', user.id);  // Changed from 'user_id' to 'author'

        if (error) {
            console.error('Error deleting companion:', error);
            return NextResponse.json({ 
                error: 'Failed to delete companion', 
                details: error.message 
            }, { status: 500 });
        }

        console.log('Companion deleted successfully:', companionId);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in delete companion API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
