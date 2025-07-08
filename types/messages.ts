export interface SavedMessage {
    role: 'assistant' | 'user';
    content: string;
}

export interface SessionRecap {
    id: string;
    user_id: string;
    companion_name: string;
    subject: string;
    topic: string;
    bullet_points: string[];
    key_topics: string[];
    summary: string;
    messages_count: number;
    created_at: string;
}

export interface RecapRequest {
    messages: SavedMessage[];
    companionName: string;
    subject: string;
    topic: string;
}
