'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn, getSubjectColor, getSubjectLogoColor } from '@/lib/utils'

interface JourneyCompanionCardProps {
    id: string
    name: string
    topic: string
    subject: string
    duration: number
}

const JourneyCompanionCard = ({ id, name, topic, subject, duration }: JourneyCompanionCardProps) => {
    const [logoColor, setLogoColor] = useState('')
    const [badgeColor, setBadgeColor] = useState('')

    useEffect(() => {
        const updateColors = () => {
            setLogoColor(getSubjectLogoColor(subject))
            setBadgeColor(getSubjectColor(subject))
        }
        updateColors()
        const observer = new MutationObserver(updateColors)
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
        return () => observer.disconnect()
    }, [subject])

    return (
        <Link href={`/companions/${id}`} className="journey-companion-card group block">
            <div className="flex items-center gap-3 mb-3">
                <div
                    className="size-12 flex-shrink-0 flex items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: logoColor || getSubjectLogoColor(subject) }}
                >
                    <Image
                        src={`/icons/${subject}.svg`}
                        alt={subject}
                        width={26}
                        height={26}
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm leading-tight line-clamp-1 text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{topic}</p>
                </div>
            </div>
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
                <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize text-white"
                    style={{ backgroundColor: badgeColor || 'hsl(var(--primary))' }}
                >
                    {subject}
                </span>
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {duration} mins
                </span>
            </div>
        </Link>
    )
}

export default JourneyCompanionCard
