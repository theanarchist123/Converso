import { createSupabaseClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import type { SavedMessage } from '@/types/messages';

export const getLastSessionTranscript = async (companionId: string): Promise<SavedMessage[]> => {
    const { userId } = await auth();
    if (!userId) return [];
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("session_transcripts")
        .select("messages, created_at")
        .eq("user_id", userId)
        .eq("companion_id", companionId)
        .order("created_at", { ascending: false })
        .limit(1);
    if (error || !data || data.length === 0) return [];
    return data[0].messages || [];
};
