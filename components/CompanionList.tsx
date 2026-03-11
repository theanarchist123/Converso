'use client'

import React, { useState, useEffect } from 'react'
import { cn, getSubjectColor, getSubjectLogoColor } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import type { Companion } from "@/types";

interface CompanionsListProps {
    title: string;
    companions?: Companion[];
    classNames?: string;
}

// Subject dot color map
const subjectDotColors: Record<string, string> = {
    coding: '#f97316',
    science: '#8b5cf6',
    maths: '#3b82f6',
    english: '#10b981',
    history: '#f59e0b',
    default: '#6b7280',
}

function getSubjectDot(subject: string) {
    return subjectDotColors[subject?.toLowerCase()] ?? subjectDotColors.default
}

const CompanionList = ({ title, companions, classNames }: CompanionsListProps) => {
    const [logoColorMap, setLogoColorMap] = useState<Record<string, string>>({});

    useEffect(() => {
        const updateColors = () => {
            const map: Record<string, string> = {};
            companions?.forEach(({ subject }) => {
                map[subject] = getSubjectLogoColor(subject);
            });
            setLogoColorMap(map);
        };
        updateColors();
        const observer = new MutationObserver(updateColors);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, [companions]);

    return (
        <article className={cn('home-feed-panel', classNames)}>
            <div className="flex items-center gap-3 mb-5">
                <div className="size-8 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                    <svg className="size-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="font-bold text-xl text-foreground">{title}</h2>
            </div>

            <div className="flex flex-col divide-y divide-border">
                {companions?.map(({ id, subject, name, topic, duration }) => (
                    <Link
                        key={id}
                        href={`/companions/${id}`}
                        className="home-feed-row group"
                    >
                        {/* Icon */}
                        <div
                            className="size-11 rounded-xl flex items-center justify-center flex-shrink-0 max-md:hidden transition-colors duration-200"
                            style={{ backgroundColor: logoColorMap[subject] || getSubjectLogoColor(subject) }}
                        >
                            <Image src={`/icons/${subject}.svg`} alt={subject} width={24} height={22} />
                        </div>

                        {/* Subject dot (mobile) */}
                        <span
                            className="size-2.5 rounded-full flex-shrink-0 md:hidden mt-1"
                            style={{ backgroundColor: getSubjectDot(subject) }}
                        />

                        {/* Name + topic */}
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors truncate">{name}</span>
                            <span className="text-sm text-muted-foreground truncate">{topic}</span>
                        </div>

                        {/* Subject badge */}
                        <span
                            className="px-2.5 py-1 rounded-full text-xs font-bold text-white capitalize flex-shrink-0 max-md:hidden"
                            style={{ backgroundColor: getSubjectDot(subject) }}
                        >
                            {subject}
                        </span>

                        {/* Duration */}
                        <span className="text-sm font-semibold text-muted-foreground flex-shrink-0 min-w-[52px] text-right">{duration} min</span>

                        {/* Arrow */}
                        <svg
                            className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 max-sm:hidden"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                        </svg>
                    </Link>
                ))}
            </div>

            {(!companions || companions.length === 0) && (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                    <span className="text-4xl">📭</span>
                    <p className="text-muted-foreground text-sm font-medium">No sessions yet — start a lesson to see your history here.</p>
                    <Link href="/companions" className="text-primary text-sm font-semibold hover:underline">Browse companions →</Link>
                </div>
            )}
        </article>
    )
}
export default CompanionList
