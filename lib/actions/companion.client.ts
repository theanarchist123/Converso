// Client-side companion actions that call API routes

export interface CompanionFormData {
    name: string;
    subject: string;
    topic: string;
    personality: string;
    imageUrl?: string;
    style: string;
}

export const createCompanion = async (data: CompanionFormData) => {
    try {
        const response = await fetch('/api/companion/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed to create companion');
        }

        return await response.json();
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
        const response = await fetch(`/api/companion/delete?id=${companionId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete companion');
        }

        return await response.json();
    } catch (error) {
        console.error('Error deleting companion:', error);
        throw error;
    }
};
