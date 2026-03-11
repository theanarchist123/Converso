'use client'

import React, { useState, useEffect } from 'react'
import Image from "next/image";
import Link from "next/link";
import { addBookmark, removeBookmark, deleteCompanion } from "@/lib/actions/companion.client";
import { usePathname, useRouter } from "next/navigation";
import { getSubjectColor } from "@/lib/utils";

interface CompanionCardProps {
    id: string;
    name: string;
    topic: string;
    subject: string;
    duration: number;
    color: string;
    bookmarked?: boolean;
}

const CompanionCard = ({ id, name, topic, subject, duration, color, bookmarked }: CompanionCardProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const [isDeleted, setIsDeleted] = useState(false);
    const [bgColor, setBgColor] = useState(color);
    const [hasPreviousSession, setHasPreviousSession] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        const updateColor = () => setBgColor(getSubjectColor(subject));
        updateColor();
        const observer = new MutationObserver(updateColor);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, [subject]);

    useEffect(() => {
        const checkPreviousSession = async () => {
            try {
                const response = await fetch(`/api/session/last?companionId=${id}`);
                const data = await response.json();
                setHasPreviousSession(data.hasHistory && data.messages && data.messages.length > 0);
            } catch { /* silent */ } finally {
                setCheckingSession(false);
            }
        };
        checkPreviousSession();
    }, [id]);

    if (isDeleted) return null;

    const toggleBookmark = async () => {
        try {
            bookmarked ? await removeBookmark(id) : await addBookmark(id, pathname);
            router.refresh();
        } catch { /* silent */ }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this companion? This action cannot be undone.')) {
            try {
                await deleteCompanion(id);
                setIsDeleted(true);
                router.refresh();
            } catch {
                alert('Failed to delete companion. Please try again.');
            }
        }
    };

    // Derive a consistent icon color from subject
    const subjectIconBg = bgColor;

    return (
        <article className="premium-companion-card group" style={{ '--card-accent': bgColor } as React.CSSProperties}>
            {/* Shimmer shine overlay on hover */}
            <div className="card-shimmer" />

            {/* Top row — subject badge + actions */}
            <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                    <div
                        className="size-8 rounded-xl flex items-center justify-center shadow-md ring-2 ring-white/20"
                        style={{ backgroundColor: subjectIconBg }}
                    >
                        <Image src={`/icons/${subject}.svg`} alt={subject} width={16} height={16} />
                    </div>
                    <span className="subject-badge">{subject}</span>
                </div>
                <div className="flex gap-1.5">
                    <button
                        className="companion-bookmark"
                        onClick={toggleBookmark}
                        title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
                    >
                        <Image src={`/icons/bookmark${bookmarked ? '-filled' : ''}.svg`} alt="bookmark" width={12.5} height={15} />
                    </button>
                    <button className="companion-bookmark opacity-100 hover:opacity-80 transition-opacity" onClick={handleDelete} title="Delete">
                        <Image src="/icons/trash.svg" alt="delete" width={12.5} height={15} />
                    </button>
                </div>
            </div>

            {/* Name + topic */}
            <div className="relative z-10 flex-1">
                <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 leading-tight">{name}</h2>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{topic}</p>
            </div>

            {/* Duration */}
            <div className="relative z-10 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Image src="/icons/clock.svg" alt="duration" width={13} height={13} className="opacity-60" />
                <span>{duration} minutes</span>
            </div>

            {/* CTA buttons */}
            <div className="relative z-10 w-full">
                {!checkingSession && hasPreviousSession ? (
                    <div className="flex flex-col gap-2 w-full">
                        <Link href={`/companions/${id}?continue=true`} className="w-full">
                            <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5">
                                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                                Continue
                            </button>
                        </Link>
                        <Link href={`/companions/${id}`} className="w-full">
                            <button className="w-full py-2 rounded-xl border border-border bg-transparent text-foreground text-sm font-medium hover:bg-accent transition-all duration-200">
                                Start New
                            </button>
                        </Link>
                    </div>
                ) : (
                    <Link href={`/companions/${id}`} className="w-full">
                        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Launch Lesson
                        </button>
                    </Link>
                )}
            </div>
        </article>
    )
}
export default CompanionCard
