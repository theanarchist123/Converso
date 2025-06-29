'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { SessionTranscript } from '@/lib/actions/session.actions';

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
};

const SessionHistory = () => {
    const [sessions, setSessions] = useState<SessionTranscript[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState<SessionTranscript | null>(null);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await fetch('/api/session/history');
            if (response.ok) {
                const data = await response.json();
                setSessions(data);
            }
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const openSessionModal = (session: SessionTranscript) => {
        setSelectedSession(session);
    };

    const closeSessionModal = () => {
        setSelectedSession(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading your session history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-8">
                <Image src="/icons/history.svg" alt="History" width={32} height={32} />
                <h1 className="text-3xl font-bold">Session History</h1>
            </div>

            {sessions.length === 0 ? (
                <div className="text-center py-16">
                    <Image src="/icons/history.svg" alt="No history" width={64} height={64} className="mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No conversation history yet</h3>
                    <p className="text-gray-600 mb-6">Start a conversation with a companion to see your history here.</p>
                    <a href="/companions" className="btn-primary">
                        Browse Companions
                    </a>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sessions.map((session) => (
                        <div 
                            key={session.id} 
                            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => openSessionModal(session)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="font-semibold text-lg truncate">
                                    {session.companion_name}
                                </h3>
                                <Image src="/icons/clock.svg" alt="Time" width={16} height={16} className="opacity-60" />
                            </div>
                            
                            <div className="mb-4">
                                <p className="text-sm text-gray-600" style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {session.messages.length > 0 
                                        ? session.messages[session.messages.length - 1].content
                                        : 'No messages in this session'
                                    }
                                </p>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <span>{session.messages.length} messages</span>
                                <span>{formatTimeAgo(session.created_at)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Session Detail Modal */}
            {selectedSession && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b">
                            <div>
                                <h2 className="text-xl font-semibold">{selectedSession.companion_name}</h2>
                                <p className="text-sm text-gray-600">
                                    {formatTimeAgo(selectedSession.created_at)}
                                </p>
                            </div>
                            <button 
                                onClick={closeSessionModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg width="24" height="24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            <div className="space-y-4">
                                {selectedSession.messages.map((message, index) => (
                                    <div 
                                        key={index}
                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div 
                                            className={`max-w-[70%] p-3 rounded-lg ${
                                                message.role === 'user' 
                                                    ? 'bg-blue-500 text-white' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SessionHistory;
