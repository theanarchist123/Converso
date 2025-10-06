'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getUserRecaps } from '@/lib/actions/session.actions';
import SessionRecapModal from '@/components/SessionRecapModal';
import type { SessionRecap } from '@/types/messages';

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

const RecapsPage = () => {
    const [recaps, setRecaps] = useState<SessionRecap[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecap, setSelectedRecap] = useState<SessionRecap | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<string>('all');

    useEffect(() => {
        fetchRecaps();
    }, []);

    const fetchRecaps = async () => {
        try {
            const data = await getUserRecaps();
            setRecaps(data);
        } catch (error) {
            console.error('Error fetching recaps:', error);
        } finally {
            setLoading(false);
        }
    };

    const openRecapModal = (recap: SessionRecap) => {
        setSelectedRecap(recap);
        setShowModal(true);
    };

    const closeRecapModal = () => {
        setShowModal(false);
        setSelectedRecap(null);
    };

    // Filter recaps based on search term and selected subject
    const filteredRecaps = recaps.filter(recap => {
        const matchesSearch = recap.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            recap.companion_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            recap.summary.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSubject = selectedSubject === 'all' || recap.subject.toLowerCase() === selectedSubject.toLowerCase();
        return matchesSearch && matchesSubject;
    });

    // Get unique subjects for filter dropdown
    const uniqueSubjects = Array.from(new Set(recaps.map(recap => recap.subject)));

    if (loading) {
        return (
            <main className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center animate-pulse-scale">
                        <div className="relative mx-auto mb-6 w-16 h-16">
                            <div className="absolute inset-0 animate-spin rounded-full border-4 border-gray-200"></div>
                            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" style={{ animationDuration: '1s' }}></div>
                            <div className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-t-blue-400" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading your learning recaps</h3>
                        <p className="text-gray-600">Please wait while we gather your session summaries...</p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-2xl">
                        <Image src="/icons/cap.svg" alt="Learning" width={28} height={28} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Learning Recaps</h1>
                        <p className="text-gray-600 mt-1">Review and reflect on your learning journey</p>
                    </div>
                </div>
                
                {recaps.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-blue-600">
                                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-gray-900">
                                        {filteredRecaps.length} {filteredRecaps.length === 1 ? 'recap' : 'recaps'} found
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {searchTerm || selectedSubject !== 'all' ? 'Filtered results' : `Total of ${recaps.length} learning sessions`}
                                    </div>
                                </div>
                            </div>
                            
                            {recaps.length > 3 && (
                                <div className="text-right">
                                    <div className="text-sm text-gray-600 mb-1">Learning Progress</div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-blue-500 to-primary rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min((recaps.length / 10) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium text-gray-600">{recaps.length}/10</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Search and Filter Controls */}
            {recaps.length > 0 && (
                <div className="mb-8">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary/10 to-pink-100 rounded-full flex items-center justify-center">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-primary">
                                    <path d="M3 6L5 6M5 6C5 7.10457 5.89543 8 7 8C8.10457 8 9 7.10457 9 6C9 4.89543 8.10457 4 7 4C5.89543 4 5 4.89543 5 6ZM5 6L21 6M9 12L11 12M11 12C11 13.1046 11.8954 14 13 14C14.1046 14 15 13.1046 15 12C15 10.8954 14.1046 10 13 10C11.8954 10 11 10.8954 11 12ZM11 12L3 12M11 12L21 12M15 18L17 18M17 18C17 19.1046 17.8954 20 19 20C20.1046 20 21 19.1046 21 18C21 16.8954 20.1046 16 19 16C17.8954 16 17 16.8954 17 18ZM17 18L3 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
                        </div>
                        
                        <div className="space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
                            {/* Search Bar */}
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                                        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by topic, companion, or content..."
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

                            {/* Subject Filter */}
                            <div className="relative min-w-[200px]">
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200 cursor-pointer"
                                >
                                    <option value="all">All Subjects</option>
                                    {uniqueSubjects.map(subject => (
                                        <option key={subject} value={subject} className="capitalize">
                                            {subject.charAt(0).toUpperCase() + subject.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            </div>

                            {/* Clear Filters */}
                            {(searchTerm || selectedSubject !== 'all') && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedSubject('all');
                                    }}
                                    className="px-4 py-3 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium flex items-center gap-2"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Clear
                                </button>
                            )}
                        </div>
                        
                        {/* Quick Stats */}
                        {(searchTerm || selectedSubject !== 'all') && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        Showing {filteredRecaps.length} of {recaps.length} recaps
                                    </span>
                                    {searchTerm && (
                                        <span className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            Search: "{searchTerm}"
                                        </span>
                                    )}
                                    {selectedSubject !== 'all' && (
                                        <span className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                                            Subject: {selectedSubject}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {recaps.length === 0 ? (
                <div className="text-center py-20">
                    <div className="relative inline-block mb-8">
                        <div className="w-40 h-40 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl flex items-center justify-center mx-auto relative overflow-hidden shadow-lg">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-blue-500/5 to-primary/10 animate-pulse"></div>
                            <Image src="/icons/cap.svg" alt="Education" width={56} height={56} className="opacity-60 relative z-10" />
                        </div>
                        <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-gentle">
                            <span className="text-3xl">📚</span>
                        </div>
                        <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-gradient-to-br from-blue-100 to-primary/20 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-gentle" style={{ animationDelay: '0.5s' }}>
                            <span className="text-2xl">🧠</span>
                        </div>
                        <div className="absolute top-0 left-0 w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center shadow-md animate-pulse" style={{ animationDelay: '1s' }}>
                            <span className="text-sm">✨</span>
                        </div>
                    </div>
                    <div className="max-w-2xl mx-auto">
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">Your Learning Journey Awaits!</h3>
                        <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                            Start meaningful conversations with our AI companions and watch your knowledge grow. 
                            Each session will generate intelligent summaries and insights to track your progress.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <a
                                href="/companions"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl hover:from-primary/90 hover:to-blue-600/90 transition-all duration-300 hover:shadow-lg font-semibold group transform hover:scale-105"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:scale-110 transition-transform duration-300">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                                </svg>
                                Start Your First Session
                            </a>
                            <a
                                href="/session-history"
                                className="inline-flex items-center gap-2 px-6 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-medium"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                View Session History
                            </a>
                        </div>
                    </div>
                </div>
            ) : filteredRecaps.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No matching recaps found</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Try adjusting your search terms or filters to discover more learning sessions.
                    </p>
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedSubject('all');
                        }}
                        className="px-8 py-3 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        Show All Recaps
                    </button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredRecaps.map((recap, index) => (
                        <div
                            key={recap.id}
                            className="group relative bg-white rounded-4xl border border-black p-6 hover:shadow-xl hover:border-primary hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                            onClick={() => openRecapModal(recap)}
                            style={{
                                animationDelay: `${index * 100}ms`
                            }}
                        >
                            {/* Gradient overlay */}
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            {/* Header */}
                            <div className="flex items-start justify-between mb-5 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <Image 
                                            src={`/icons/${recap.subject.toLowerCase()}.svg`} 
                                            alt={recap.subject} 
                                            width={24} 
                                            height={24} 
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors duration-300">{recap.companion_name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-600 capitalize">{recap.subject}</span>
                                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                            <span className="text-xs text-gray-500">{formatTimeAgo(recap.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2 bg-gray-100 rounded-full group-hover:bg-primary/10 transition-colors duration-300">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-gray-400 group-hover:text-primary transition-colors duration-300">
                                        <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            </div>

                            {/* Topic */}
                            <div className="mb-5">
                                <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-2xl p-4 border border-gray-100 group-hover:border-primary/20 transition-all duration-300">
                                    <h4 className="font-semibold text-gray-900 mb-1">Topic</h4>
                                    <p className="text-sm text-gray-700 line-clamp-2">{recap.topic}</p>
                                </div>
                            </div>

                            {/* Key Points Preview */}
                            <div className="mb-5">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    Key Learning Points
                                </h4>
                                <div className="space-y-2">
                                    {recap.bullet_points.slice(0, 2).map((point, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                            <span className="text-sm text-gray-600 line-clamp-1 leading-relaxed">{point}</span>
                                        </div>
                                    ))}
                                    {recap.bullet_points.length > 2 && (
                                        <div className="text-xs text-primary font-medium pl-5">
                                            +{recap.bullet_points.length - 2} more insights
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Key Topics */}
                            <div className="mb-4">
                                <div className="flex flex-wrap gap-2">
                                    {recap.key_topics.slice(0, 3).map((topic, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100 group-hover:bg-blue-100 transition-colors duration-300"
                                        >
                                            {topic}
                                        </span>
                                    ))}
                                    {recap.key_topics.length > 3 && (
                                        <span className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full text-xs font-medium border border-gray-100">
                                            +{recap.key_topics.length - 3}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Footer Stats */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-full border border-green-100">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-xs font-semibold text-green-700">AI Generated</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="text-xs text-primary font-semibold">View Recap</span>
                                </div>
                            </div>
                            
                            {/* Hover indicator line */}
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full"></div>
                        </div>
                    ))}
                </div>
            )}

            <SessionRecapModal
                isOpen={showModal}
                onClose={closeRecapModal}
                recap={selectedRecap}
                companionName={selectedRecap?.companion_name || ''}
                subject={selectedRecap?.subject || ''}
            />
        </main>
    );
};

export default RecapsPage;
