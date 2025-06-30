// Client-side companion actions that call API routes

export interface CompanionFormData {
    name: string;
    subject: string;
    topic: string;
    voice: string;  // Changed from personality to voice
    style: string;
    duration?: number;  // Added duration field
}

export const createCompanion = async (data: CompanionFormData) => {
    try {
        console.log('Sending companion data:', data);
        
        const response = await fetch('/api/companion/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(errorData.error || 'Failed to create companion');
        }

        const result = await response.json();
        console.log('Companion created successfully:', result);
        return result;
    } catch (error) {
        console.error('Error creating companion:', error);
        throw error;
    }
};

export const addBookmark = async (companionId: string, pathname?: string) => {
    try {
        const response = await fetch('/api/companion/bookmark', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ companionId, pathname })
        });

        if (!response.ok) {
            throw new Error('Failed to add bookmark');
        }

        return await response.json();
    } catch (error) {
        console.error('Error adding bookmark:', error);
        throw error;
    }
};

export const removeBookmark = async (companionId: string) => {
    try {
        const response = await fetch(`/api/companion/bookmark?companionId=${companionId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to remove bookmark');
        }

        return await response.json();
    } catch (error) {
        console.error('Error removing bookmark:', error);
        throw error;
    }
};

export const deleteCompanion = async (companionId: string) => {
    try {
        console.log('Deleting companion:', companionId);
        
        const response = await fetch(`/api/companion/delete?id=${companionId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Delete API Error:', errorData);
            throw new Error(errorData.details || errorData.error || 'Failed to delete companion');
        }

        const result = await response.json();
        console.log('Companion deleted successfully:', result);
        return result;
    } catch (error) {
        console.error('Error deleting companion:', error);
        throw error;
    }
};
