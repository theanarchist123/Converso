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
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'companion'>('newest');

    useEffect(() => {
        fetchSessions();
    }, []);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && selectedSession) {
                closeSessionModal();
            }
        };

        if (selectedSession) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [selectedSession]);

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

    // Filter and sort sessions
    const filteredAndSortedSessions = sessions
        .filter(session => {
            const matchesSearch = session.companion_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                session.messages.some(msg => msg.content.toLowerCase().includes(searchTerm.toLowerCase()));
            return matchesSearch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'oldest':
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                case 'companion':
                    return (a.companion_name || '').localeCompare(b.companion_name || '');
                default:
                    return 0;
            }
        });

    // Calculate stats
    const totalMessages = sessions.reduce((sum, session) => sum + session.messages.length, 0);
    const uniqueCompanions = new Set(sessions.map(s => s.companion_name)).size;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center animate-pulse-scale">
                    <div className="relative mx-auto mb-6 w-16 h-16">
                        {/* Outer ring */}
                        <div className="absolute inset-0 animate-spin rounded-full border-4 border-gray-200"></div>
                        {/* Inner ring with primary color */}
                        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" style={{ animationDuration: '1s' }}></div>
                        {/* Additional inner ring for more visual interest */}
                        <div className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-t-blue-400" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading your session history</h3>
                    <p className="text-gray-600">Please wait while we fetch your conversations...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="container mx-auto px-4 py-8">
            {/* Enhanced Header Section */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl">
                        <Image src="/icons/history.svg" alt="History" width={28} height={28} className="text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Session History</h1>
                        <p className="text-gray-600 mt-1">Review your past conversations and learning sessions</p>
                    </div>
                </div>
                
                {sessions.length > 0 && (
                    <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6 border border-green-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-green-600">
                                        <path d="M8 12H16M12 8V16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{filteredAndSortedSessions.length}</div>
                                <div className="text-sm text-gray-600">Learning Sessions</div>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-600">
                                        <path d="M8 12H16M12 8V16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{totalMessages}</div>
                                <div className="text-sm text-gray-600">Total Messages</div>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
                                        <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12ZM12 14C8.13401 14 5 17.134 5 21V22H19V21C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{uniqueCompanions}</div>
                                <div className="text-sm text-gray-600">AI Companions</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Search and Sort Controls */}
            {sessions.length > 0 && (
                <div className="mb-8">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-indigo-600">
                                    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Search & Sort</h3>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search Bar */}
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                                        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by companion name or message content..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-gray-50 focus:bg-white"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {/* Sort Dropdown */}
                            <div className="relative min-w-[200px]">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'companion')}
                                    className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200 cursor-pointer"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="companion">By Companion</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                        {/* Quick Stats for Filtered Results */}
                        {searchTerm && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        Showing {filteredAndSortedSessions.length} of {sessions.length} sessions
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        Search: "{searchTerm}"
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {sessions.length === 0 ? (
                <div className="text-center py-20">
                    <div className="relative inline-block mb-8 animate-bounce-gentle">
                        <div className="w-32 h-32 bg-gradient-to-br from-primary/10 via-primary/5 to-blue-50 rounded-full flex items-center justify-center mx-auto shadow-lg">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center">
                                <Image src="/icons/history.svg" alt="No history" width={40} height={40} className="opacity-60" />
                            </div>
                        </div>
                        <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                            <span className="text-2xl">💭</span>
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">No conversation history yet</h3>
                    <p className="text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed text-lg">
                        Start your learning journey by having a conversation with one of our AI companions. 
                        Your session history will appear here, and you'll be able to review all your past conversations.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                        <a href="/companions" className="btn-primary inline-flex items-center gap-3 text-base px-8 py-4 rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300 group">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:rotate-12 transition-transform duration-300">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                            </svg>
                            Browse Companions
                        </a>
                        <a href="/app" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary px-6 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                            </svg>
                            Back to Dashboard
                        </a>
                    </div>
                </div>
            ) : filteredAndSortedSessions.length === 0 ? (
                <div className="text-center py-16">
                    <div className="relative inline-block mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div className="absolute -top-1 -right-1 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-sm">❌</span>
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No sessions match your search</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                        Try adjusting your search terms or browse all sessions.
                    </p>
                    <button 
                        onClick={() => setSearchTerm('')}
                        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 px-4 py-2 rounded-xl hover:bg-primary/5 transition-all duration-300"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Clear Search
                    </button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredAndSortedSessions.map((session, index) => (
                        <div 
                            key={session.id} 
                            className="group relative bg-white rounded-3xl border border-gray-200 p-6 hover:shadow-2xl hover:border-primary/30 hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden animate-slideIn"
                            onClick={() => openSessionModal(session)}
                            style={{
                                animationDelay: `${index * 100}ms`
                            }}
                        >
                            {/* Gradient overlay for visual interest */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 via-blue-500/5 to-primary/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            {/* Header with companion name and time */}
                            <div className="flex items-start justify-between mb-5 relative z-10">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-sm"></div>
                                        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Session</span>
                                    </div>
                                    <h3 className="font-bold text-xl text-gray-900 truncate group-hover:text-primary transition-colors duration-300 mb-1">
                                        {session.companion_name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                                            <path d="M12 1V23M17.657 6.343L6.343 17.657M23 12H1M17.657 17.657L6.343 6.343" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                        </svg>
                                        <span className="font-medium">{formatTimeAgo(session.created_at)}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="p-2.5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl group-hover:from-primary/10 group-hover:to-blue-500/10 transition-all duration-300 shadow-sm">
                                        <Image src="/icons/clock.svg" alt="Time" width={16} height={16} className="opacity-60 group-hover:opacity-80" />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Message preview with improved styling */}
                            <div className="mb-6 relative">
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100/80 rounded-2xl p-5 border border-gray-100 group-hover:from-primary/5 group-hover:to-blue-500/5 group-hover:border-primary/20 transition-all duration-300 shadow-sm group-hover:shadow-md">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="text-xs text-gray-600 font-semibold">Last Message</span>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-3 group-hover:text-gray-800 transition-colors duration-300">
                                        {session.messages.length > 0 
                                            ? session.messages[session.messages.length - 1].content
                                            : 'No messages in this session'
                                        }
                                    </p>
                                </div>
                                {/* Enhanced speech bubble tail */}
                                <div className="absolute -bottom-1 left-6 w-4 h-4 bg-gradient-to-br from-gray-50 to-gray-100/80 border-l border-b border-gray-100 rotate-45 group-hover:from-primary/5 group-hover:to-blue-500/5 group-hover:border-primary/20 transition-all duration-300"></div>
                            </div>
                            
                            {/* Enhanced footer stats */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300 shadow-sm">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-blue-600">
                                            <path d="M8 12H16M12 8V16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <span className="text-sm font-bold text-blue-700">{session.messages.length}</span>
                                        <span className="text-xs text-blue-600 font-medium">msgs</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                    <span className="text-sm text-primary font-semibold">View Chat</span>
                                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-primary">
                                            <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Enhanced hover indicator line */}
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-full"></div>
                            
                            {/* Subtle hover glow effect */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-blue-500/20 to-primary/20 rounded-3xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10"></div>
                        </div>
                    ))}
                </div>
            )}

            {/* Enhanced Session Detail Modal */}
            {selectedSession && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
                    onClick={closeSessionModal}
                >
                    <div 
                        className="bg-white rounded-3xl max-w-5xl w-full max-h-[85vh] overflow-hidden shadow-2xl animate-slideUp border border-gray-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 via-white to-gray-50">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-primary/10 via-blue-500/10 to-primary/20 rounded-2xl flex items-center justify-center shadow-sm">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
                                        <path d="M8 12H16M12 8V16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="1.5"/>
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900">{selectedSession.companion_name}</h2>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-sm text-gray-600 font-medium">
                                                {formatTimeAgo(selectedSession.created_at)}
                                            </span>
                                        </div>
                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-primary">
                                                <path d="M8 12H16M12 8V16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="1.5"/>
                                            </svg>
                                            <span className="text-sm text-primary font-bold">
                                                {selectedSession.messages.length} messages
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    closeSessionModal();
                                }}
                                className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-2xl transition-all duration-200 group"
                            >
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:rotate-90 transition-transform duration-200">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        {/* Chat Messages */}
                        <div className="p-8 overflow-y-auto max-h-[60vh] bg-gradient-to-b from-gray-50/30 to-white">
                            <div className="space-y-6">
                                {selectedSession.messages.map((message, index) => (
                                    <div 
                                        key={index}
                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideIn`}
                                        style={{
                                            animationDelay: `${index * 50}ms`
                                        }}
                                    >
                                        <div className={`flex items-start gap-4 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            {/* Enhanced Avatar */}
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                                                message.role === 'user' 
                                                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                                                    : 'bg-gradient-to-br from-gray-100 to-gray-200'
                                            }`}>
                                                {message.role === 'user' ? (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                                        <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12ZM12 14C8.13401 14 5 17.134 5 21V22H19V21C19 17.134 15.866 14 12 14Z"/>
                                                    </svg>
                                                ) : (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#666">
                                                        <path d="M12 2L2 7L12 12L22 7L12 2ZM2 17L12 22L22 17M2 12L12 17L22 12"/>
                                                    </svg>
                                                )}
                                            </div>
                                            
                                            {/* Enhanced Message bubble */}
                                            <div 
                                                className={`relative px-6 py-4 rounded-3xl shadow-sm ${
                                                    message.role === 'user' 
                                                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' 
                                                        : 'bg-white text-gray-800 border border-gray-200 shadow-md'
                                                }`}
                                            >
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                                
                                                {/* Enhanced Message tail */}
                                                <div className={`absolute top-4 w-3 h-3 transform rotate-45 ${
                                                    message.role === 'user' 
                                                        ? '-right-1.5 bg-gradient-to-br from-blue-500 to-indigo-600' 
                                                        : '-left-1.5 bg-white border-l border-b border-gray-200'
                                                }`}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Enhanced scroll indicator */}
                            <div className="flex justify-center mt-8 opacity-60">
                                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                    <span>End of conversation</span>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default SessionHistory;
