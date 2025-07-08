'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import type { SessionRecap } from '@/types/messages';

interface SessionRecapModalProps {
    isOpen: boolean;
    onClose: () => void;
    recap: SessionRecap | null;
    companionName: string;
    subject: string;
}

const SessionRecapModal = ({ isOpen, onClose, recap, companionName, subject }: SessionRecapModalProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const shareMenuRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // Handle click outside to close share menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
                setShowShareMenu(false);
            }
        };

        if (showShareMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showShareMenu]);

    // Handle escape key to close modal
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setShowShareMenu(false);
            setCopySuccess(false);
        }
    }, [isOpen]);

    // Close share menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
                setShowShareMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isOpen || !recap) return null;

    const handleShare = async (type: 'copy' | 'twitter' | 'linkedin') => {
        const shareText = `Just completed a learning session about "${recap.topic}" with ${companionName}! 🧠✨\n\nKey insights:\n${recap.bullet_points.slice(0, 2).map(point => `• ${point}`).join('\n')}\n\n#Learning #AI #Education`;
        
        switch (type) {
            case 'copy':
                try {
                    await navigator.clipboard.writeText(shareText);
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 2000);
                } catch (err) {
                    console.error('Failed to copy to clipboard:', err);
                }
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
                break;
            case 'linkedin':
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(shareText)}`, '_blank');
                break;
        }
        setShowShareMenu(false);
    };

    const handleExport = () => {
        const content = `# Learning Recap: ${recap.topic}

**Date:** ${new Date(recap.created_at).toLocaleDateString()}  
**Companion:** ${companionName}  
**Subject:** ${subject}  
**Duration:** ${recap.messages_count || 'N/A'} messages exchanged  

## Summary
${recap.summary}

## Key Topics Covered
${recap.key_topics.map(topic => `- ${topic}`).join('\n')}

## Key Learning Points
${recap.bullet_points.map((point, i) => `${i + 1}. ${point}`).join('\n')}

---
*Generated with AI-powered learning recap*`;
        
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${recap.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_recap.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={(e) => {
                // Close modal when clicking on backdrop
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div 
                ref={modalRef}
                className="bg-white rounded-4xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Enhanced Header */}
                <div className="relative bg-gradient-to-r from-gray-50 via-white to-blue-50/30 p-8 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-2xl flex items-center justify-center shadow-sm">
                                <Image 
                                    src={`/icons/${subject.toLowerCase()}.svg`} 
                                    alt={subject} 
                                    width={32} 
                                    height={32} 
                                />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-1">Learning Recap</h2>
                                <div className="flex items-center gap-3">
                                    <p className="text-gray-600 font-medium">with {companionName}</p>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                    <span className="text-sm text-primary font-semibold capitalize">{subject}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onClose();
                            }}
                            className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 z-10 relative"
                            type="button"
                            aria-label="Close modal"
                        >
                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    {/* Action buttons in header */}
                    <div className="flex items-center gap-3 mt-4">
                        <div className="relative" ref={shareMenuRef}>
                            <button
                                onClick={() => setShowShareMenu(!showShareMenu)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-all duration-200 text-sm font-medium"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                                </svg>
                                Share
                            </button>
                            
                            {/* Share dropdown */}
                            {showShareMenu && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-10 animate-slideUp">
                                    <button
                                        onClick={() => handleShare('copy')}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                        </svg>
                                        {copySuccess ? 'Copied!' : 'Copy to clipboard'}
                                    </button>
                                    <button
                                        onClick={() => handleShare('twitter')}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                        </svg>
                                        Share on Twitter
                                    </button>
                                    <button
                                        onClick={() => handleShare('linkedin')}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                        </svg>
                                        Share on LinkedIn
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <div className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                            <span className="flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                AI Generated
                            </span>
                        </div>
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-4xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-tr-4xl"></div>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto max-h-[70vh] bg-gray-50/30">
                    {/* Topic Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-3 h-3 bg-gradient-to-r from-primary to-blue-500 rounded-full"></div>
                            <h3 className="text-xl font-bold text-gray-900">Session Topic</h3>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                            <p className="text-gray-800 font-medium text-lg">{recap.topic}</p>
                        </div>
                    </div>

                    {/* Summary Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                            <h3 className="text-xl font-bold text-gray-900">AI-Generated Summary</h3>
                        </div>
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200/50">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-green-600">
                                        <path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z" fill="currentColor"/>
                                    </svg>
                                </div>
                                <p className="text-gray-800 leading-relaxed text-base">{recap.summary}</p>
                            </div>
                        </div>
                    </div>

                    {/* Key Topics Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                            <h3 className="text-xl font-bold text-gray-900">Key Topics Covered</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {recap.key_topics.map((topic, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-2xl p-4 border border-blue-200/50 shadow-sm hover:shadow-md transition-shadow duration-300"
                                    style={{
                                        animationDelay: `${index * 100}ms`
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        </div>
                                        <span className="text-gray-800 font-medium text-sm">{topic}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Key Learning Points Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                            <h3 className="text-xl font-bold text-gray-900">Key Learning Points</h3>
                        </div>
                        <div className="space-y-4">
                            {recap.bullet_points.map((point, index) => (
                                <div 
                                    key={index} 
                                    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 animate-slideIn"
                                    style={{
                                        animationDelay: `${index * 150}ms`
                                    }}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <span className="text-orange-600 font-bold text-sm">{index + 1}</span>
                                        </div>
                                        <p className="text-gray-800 leading-relaxed text-base">{point}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="mb-6">
                        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                            <h4 className="text-lg font-bold text-gray-900 mb-4">Session Statistics</h4>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-blue-600">
                                            <path d="M8 12H16M12 8V16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="1.5"/>
                                        </svg>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">{recap.bullet_points.length}</div>
                                    <div className="text-sm text-gray-600">Learning Points</div>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-purple-600">
                                            <path d="M12 2L2 7L12 12L22 7L12 2ZM2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5"/>
                                        </svg>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">{recap.key_topics.length}</div>
                                    <div className="text-sm text-gray-600">Topics Covered</div>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-green-600">
                                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="1.5"/>
                                        </svg>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">{recap.messages_count || 'N/A'}</div>
                                    <div className="text-sm text-gray-600">Messages</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Actions */}
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <div className="flex gap-4">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onClose();
                            }}
                            className="flex-1 px-6 py-3 bg-white text-gray-700 rounded-2xl border border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium"
                            type="button"
                        >
                            Close
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex-1 px-6 py-3 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all duration-200 font-medium inline-flex items-center justify-center gap-2 group"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:scale-110 transition-transform duration-300">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                            Export Recap
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionRecapModal;
