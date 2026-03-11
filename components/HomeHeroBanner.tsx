'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const cyclingPhrases = [
    'Ready to learn something new today?',
    'Your AI tutors are waiting for you.',
    'Keep exploring — knowledge compounds.',
    'Pick up right where you left off.',
]

interface HomeHeroBannerProps {
    firstName?: string | null
    sessionCount: number
    companionCount: number
    subjectCount: number
}

export default function HomeHeroBanner({ firstName, sessionCount, companionCount, subjectCount }: HomeHeroBannerProps) {
    const [phraseIndex, setPhraseIndex] = useState(0)
    const [fading, setFading] = useState(true)

    useEffect(() => {
        const interval = setInterval(() => {
            setFading(false)
            setTimeout(() => {
                setPhraseIndex(i => (i + 1) % cyclingPhrases.length)
                setFading(true)
            }, 400)
        }, 3500)
        return () => clearInterval(interval)
    }, [])

    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

    const stats = [
        { label: 'Sessions', value: sessionCount, icon: '🎯' },
        { label: 'Companions', value: companionCount, icon: '🤖' },
        { label: 'Subjects', value: subjectCount, icon: '📚' },
    ]

    return (
        <section className="home-hero">
            {/* Decorative blobs */}
            <div className="hero-blob hero-blob-1" />
            <div className="hero-blob hero-blob-2" />
            <div className="hero-blob hero-blob-3" />

            <div className="relative z-10 flex flex-col gap-3 max-w-2xl">
                <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold tracking-wide">
                        <span className="size-1.5 rounded-full bg-primary animate-pulse inline-block" />
                        AI Learning Platform
                    </span>
                </div>

                <h1 className="text-4xl font-extrabold text-foreground leading-tight">
                    {greeting}{firstName ? `, ${firstName}` : ''}!{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-yellow-400">
                        👋
                    </span>
                </h1>

                <p
                    className="text-lg text-muted-foreground font-medium transition-opacity duration-400"
                    style={{ opacity: fading ? 1 : 0 }}
                >
                    {cyclingPhrases[phraseIndex]}
                </p>

                <div className="flex items-center gap-3 mt-2">
                    <Link
                        href="/companions"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200"
                    >
                        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Explore Companions
                    </Link>
                    <Link
                        href="/my-journey"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border text-foreground font-semibold text-sm hover:bg-accent hover:-translate-y-0.5 transition-all duration-200"
                    >
                        My Journey
                    </Link>
                </div>
            </div>

            {/* Stats chips */}
            <div className="relative z-10 flex flex-wrap gap-3 ml-auto max-lg:ml-0 mt-2">
                {stats.map(stat => (
                    <div key={stat.label} className="home-stat-chip">
                        <span className="text-2xl">{stat.icon}</span>
                        <div className="flex flex-col leading-none">
                            <span className="text-xl font-extrabold text-foreground">{stat.value}</span>
                            <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
