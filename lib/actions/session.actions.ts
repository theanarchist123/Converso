// Client-side session types and utilities
import type { SavedMessage } from '@/types/messages';

export interface SessionTranscript {
    id: string;
    companion_id: string;
    companion_name?: string;
    messages: SavedMessage[];
    created_at: string;
}

// Client-side functions that call API routes
export const getLastSessionTranscript = async (companionId: string): Promise<SavedMessage[]> => {
    try {
        const response = await fetch(`/api/session/last?companionId=${companionId}`);
        if (!response.ok) return [];
        const data = await response.json();
        return data.messages || [];
    } catch (error) {
        console.error('Error fetching last session:', error);
        return [];
    }
};

export const getAllSessionTranscripts = async (): Promise<SessionTranscript[]> => {
    try {
        const response = await fetch('/api/session/history');
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error('Error fetching all sessions:', error);
        return [];
    }
};

export const saveSessionTranscript = async (companionId: string, messages: SavedMessage[]): Promise<boolean> => {
    try {
        const response = await fetch('/api/session/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ companionId, messages })
        });
        return response.ok;
    } catch (error) {
        console.error('Error saving session:', error);
        return false;
    }
};
