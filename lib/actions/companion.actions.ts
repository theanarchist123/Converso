"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import type { CreateCompanion, GetAllCompanions, SavedMessage, SessionTranscript } from "@/types/index";

export const createCompanion = async (formData: CreateCompanion) => {
    const { userId: author } = await auth();
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from('companions')
        .insert({...formData, author })
        .select();

    if(error || !data) throw new Error(error?.message || 'Failed to create a companion');

    return data[0];
}

export const getAllCompanions = async ({                                           
    limit = 10,
    page = 1,
    subject,
    topic,
    bookmarked,
}: GetAllCompanions) => {    
    const supabase = createSupabaseClient();

    const { userId } = await auth();
    if (!userId) return [];

    let query = supabase.from("companions").select();

    if (bookmarked) {
        // If bookmarked is true, first get the bookmarked companion IDs
        const { data: bookmarks } = await supabase
            .from("bookmarks")
            .select("companion_id")
            .eq("user_id", userId);

        if (bookmarks && bookmarks.length > 0) {
            // Get companions that are both bookmarked by the user
            const bookmarkedIds = bookmarks.map(({ companion_id }) => companion_id);
            query = query.in("id", bookmarkedIds);
        } else {
            // If no bookmarks, return empty array
            return [];
        }
    } 

    query = query.eq("author", userId);

    if (subject && topic) {
        query = query
            .ilike("subject", `%${subject}%`)
            .or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
    } else if (subject) {
        query = query.ilike("subject", `%${subject}%`);
    } else if (topic) {
        query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
    }

    query = query.range((page - 1) * limit, page * limit - 1);

    const { data: companions, error } = await query;

    if (error) {
        throw new Error(error.message);
    }

    if (!companions) return [];

    // Get an array of companion IDs
    const companionIds = companions.map((companion) => companion.id);

    // Get the bookmarks where user_id is the current user and companion_id is in the array of companion IDs
    const { data: bookmarks } = await supabase
        .from("bookmarks")
        .select()
        .eq("user_id", userId)
        .in("companion_id", companionIds);

    const marks = new Set(bookmarks?.map(({ companion_id }) => companion_id));

    // Add a bookmarked property to each companion
    companions.forEach((companion) => {
        companion.bookmarked = marks.has(companion.id);
    });

    // Return the companions as before, but with the bookmarked property added
    return companions;
};

export const getCompanion = async (id: string) => {
    const { userId } = await auth();
    if (!userId) return null;
    
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from("companions")
        .select()
        .eq("id", id)
        .eq("author", userId);

    if (error) return console.log(error);

    return data[0];
};

export const addToSessionHistory = async (companionId: string) => {
    const { userId } = await auth();
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.from("session_history").insert({
        companion_id: companionId,
        user_id: userId,
    });

    if (error) throw new Error(error.message);

    return data;
};

export const getRecentSessions = async (limit = 10) => {
    const { userId } = await auth();
    if (!userId) return [];
    
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("session_history")
        .select(`companions:companion_id (*)`)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) throw new Error(error.message);

    return data.map(({ companions }) => companions);
};

export const getUserSessions = async (userId: string, limit = 10) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("session_history")
        .select(`companions:companion_id (*)`)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) throw new Error(error.message);

    return data.map(({ companions }) => companions);
};

export const getUserCompanions = async (userId: string) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("companions")
        .select()
        .eq("author", userId);

    if (error) throw new Error(error.message);

    return data;
};

export const newCompanionPermissions = async () => {
    const { userId, has } = await auth();
    if (!userId) return false;
    
    const supabase = createSupabaseClient();

    // First get the current count of user's companions
    const { count, error: countError } = await supabase
        .from("companions")
        .select("*", { count: "exact" })
        .eq("author", userId);

    if (countError) throw new Error(countError.message);

    if (!count) return true; // If no companions yet, allow creation

    // Check plan limits
    if (has({ plan: "pro" })) {
        return true; // Pro users have unlimited companions
    }

    // Core learner has 10 companion limit
    if (has({ feature: "10_companion_limit" }) && count < 10) {
        return true;
    }

    // Beginner has 3 companion limit
    if (has({ feature: "3_companion_limit" }) && count < 3) {
        return true;
    }

    // If we get here, user has exceeded their limit
    return false;
};

// Bookmarks
export const addBookmark = async (companionId: string, path: string) => {
    const { userId } = await auth();
    if (!userId) return;
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.from("bookmarks").insert({
        companion_id: companionId,
        user_id: userId,
    });
    if (error) {
        throw new Error(error.message);
    }
    // Revalidate the path to force a re-render of the page

    revalidatePath(path);
    return data;
};

export const removeBookmark = async (companionId: string, path: string) => {
    const { userId } = await auth();
    if (!userId) return;
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("companion_id", companionId)
        .eq("user_id", userId);
    if (error) {
        throw new Error(error.message);
    }
    revalidatePath(path);
    return data;
};

// It's almost the same as getUserCompanions, but it's for the bookmarked companions
export const getBookmarkedCompanions = async (userId: string) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("bookmarks")
        .select(`companions:companion_id (*)`) // Notice the (*) to get all the companion data
        .eq("user_id", userId);
    if (error) {
        throw new Error(error.message);
    }
    // We don't need the bookmarks data, so we return only the companions
    return data.map(({ companions }) => companions);
};

export const deleteCompanion = async (companionId: string, path: string) => {
    const { userId } = await auth();
    if (!userId) return;
    
    const supabase = createSupabaseClient();
    
    // Delete the companion
    const { error } = await supabase
        .from("companions")
        .delete()
        .eq("id", companionId)
        .eq("author", userId);

    if (error) {
        throw new Error(error.message);
    }

    // Also delete any bookmarks for this companion
    await supabase
        .from("bookmarks")
        .delete()
        .eq("companion_id", companionId);

    // Also delete any session history for this companion
    await supabase
        .from("session_history")
        .delete()
        .eq("companion_id", companionId);

    revalidatePath(path);
};

export const saveSessionTranscript = async (companionId: string, messages: SavedMessage[]) => {
    const { userId } = await auth();
    if (!userId) return;
    
    const supabase = createSupabaseClient();
    
    // Save the transcript
    const { data, error } = await supabase
        .from("session_transcripts")
        .insert({
            companion_id: companionId,
            user_id: userId,
            messages: messages,
            created_at: new Date().toISOString()
        });

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

export const getSessionTranscripts = async (): Promise<SessionTranscript[]> => {
    const { userId } = await auth();
    if (!userId) return [];
    
    const supabase = createSupabaseClient();
    
    // Get all transcripts with companion details
    const { data, error } = await supabase
        .from("session_transcripts")
        .select(`
            id,
            messages,
            created_at,
            companions:companion_id (
                name,
                subject,
                topic
            )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return data as SessionTranscript[];
};