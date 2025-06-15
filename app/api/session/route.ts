'use server';

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { userId } = await auth();
    const url = new URL(request.url);
    const companionId = url.searchParams.get('companionId');

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!companionId) {
        return NextResponse.json({ error: 'Companion ID is required' }, { status: 400 });
    }

    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("session_transcripts")
        .select("messages, created_at")
        .eq("user_id", userId)
        .eq("companion_id", companionId)
        .order("created_at", { ascending: false })
        .limit(1);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages: data?.[0]?.messages || [] });
}
