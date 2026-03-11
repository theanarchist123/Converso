'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import LearningLogForm from '@/components/LearningLogForm'
import LearningLogDisplay from '@/components/LearningLogDisplay'
import JourneyCompanionCard from '@/components/JourneyCompanionCard'

interface Companion {
    id: string
    name: string
    topic: string
    subject: string
    duration: number
}

interface JourneyTabsProps {
    bookmarkedCompanions: Companion[]
    sessionHistory: Companion[]
    companions: Companion[]
}

const tabs = [
    {
        key: 'bookmarks',
        label: 'Bookmarks',
        icon: (
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
        ),
    },
    {
        key: 'sessions',
        label: 'Recent Sessions',
        icon: (
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        key: 'companions',
        label: 'My Companions',
        icon: (
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
    {
        key: 'logs',
        label: 'Learning Logs',
        icon: (
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
        ),
    },
]

function CompanionGrid({ items, emptyMessage }: { items: Companion[]; emptyMessage: string }) {
    if (items.length === 0) {
        return (
            <div className="journey-empty-state">
                <div className="size-16 rounded-2xl bg-muted flex items-center justify-center text-3xl">🔍</div>
                <p className="text-sm font-medium text-muted-foreground">{emptyMessage}</p>
            </div>
        )
    }
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {items.map((item) => (
                <JourneyCompanionCard key={item.id} {...item} />
            ))}
        </div>
    )
}

export default function JourneyTabs({ bookmarkedCompanions, sessionHistory, companions }: JourneyTabsProps) {
    const [activeTab, setActiveTab] = useState('bookmarks')

    const sectionData: Record<string, { items: Companion[]; emptyMessage: string; badge?: number }> = {
        bookmarks: { items: bookmarkedCompanions, emptyMessage: 'No bookmarked companions yet', badge: bookmarkedCompanions.length },
        sessions: { items: sessionHistory, emptyMessage: 'No recent sessions yet' },
        companions: { items: companions, emptyMessage: 'No companions created yet', badge: companions.length },
    }

    return (
        <div className="space-y-4">
            {/* Tab Bar */}
            <div className="flex gap-1.5 p-1.5 rounded-2xl bg-muted overflow-x-auto no-scrollbar">
                {tabs.map((tab) => {
                    const data = sectionData[tab.key]
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn('journey-tab flex items-center gap-2', activeTab === tab.key && 'journey-tab-active')}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                            {data?.badge !== undefined && data.badge > 0 && (
                                <span className={cn(
                                    'text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center',
                                    activeTab === tab.key
                                        ? 'bg-primary text-white'
                                        : 'bg-muted-foreground/20 text-muted-foreground'
                                )}>
                                    {data.badge}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Tab Panel */}
            <div className="rounded-2xl border border-border bg-card/50 p-6 animate-fadeIn pb-8">
                {activeTab === 'bookmarks' && (
                    <>
                        <div className="journey-section-header">
                            <div className="journey-section-icon bg-amber-100 dark:bg-amber-900/30">🔖</div>
                            <div>
                                <h2 className="font-bold text-lg text-foreground">Bookmarked Companions</h2>
                                <p className="text-xs text-muted-foreground">{bookmarkedCompanions.length} saved for later</p>
                            </div>
                        </div>
                        <CompanionGrid items={bookmarkedCompanions} emptyMessage="Bookmark a companion to see it here" />
                    </>
                )}

                {activeTab === 'sessions' && (
                    <>
                        <div className="journey-section-header">
                            <div className="journey-section-icon bg-blue-100 dark:bg-blue-900/30">⏱️</div>
                            <div>
                                <h2 className="font-bold text-lg text-foreground">Recent Sessions</h2>
                                <p className="text-xs text-muted-foreground">{sessionHistory.length} sessions completed</p>
                            </div>
                        </div>
                        <CompanionGrid items={sessionHistory} emptyMessage="Complete a session to see it here" />
                    </>
                )}

                {activeTab === 'companions' && (
                    <>
                        <div className="journey-section-header">
                            <div className="journey-section-icon bg-purple-100 dark:bg-purple-900/30">🤖</div>
                            <div>
                                <h2 className="font-bold text-lg text-foreground">My Companions</h2>
                                <p className="text-xs text-muted-foreground">{companions.length} companions created</p>
                            </div>
                        </div>
                        <CompanionGrid items={companions} emptyMessage="Create your first companion to get started" />
                    </>
                )}

                {activeTab === 'logs' && (
                    <>
                        <div className="journey-section-header">
                            <div className="journey-section-icon bg-emerald-100 dark:bg-emerald-900/30">📝</div>
                            <div>
                                <h2 className="font-bold text-lg text-foreground">Learning Logs</h2>
                                <p className="text-xs text-muted-foreground">Document your growth over time</p>
                            </div>
                        </div>
                        <div className="space-y-5">
                            <LearningLogForm />
                            <LearningLogDisplay limit={10} />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
