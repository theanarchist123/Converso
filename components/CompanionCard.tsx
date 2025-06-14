'use client'

import React from 'react'
import Image from "next/image";
import Link from "next/link";
import { addBookmark, removeBookmark, deleteCompanion } from "@/lib/actions/companion.actions";
import { usePathname } from "next/navigation";
interface CompanionCardProps{
    id: string;
    name: string;
    topic: string;
    subject: string;
    duration: number;
    color: string;
    bookmarked?: boolean;
}

const CompanionCard = ({id,name,topic,subject,duration,color,bookmarked}:CompanionCardProps) => {
    const pathname = usePathname();

    const toggleBookmark = async () => {
        if (bookmarked) {
            await removeBookmark(id, pathname);
        } else {
            await addBookmark(id, pathname);
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this companion? This action cannot be undone.')) {
            await deleteCompanion(id, pathname);
        }
    };

    return (
        <article className="companion-card" style={{backgroundColor: color}}>
            <div className="flex justify-between items-center">
                <div className="subject-badge">{subject}</div>
                <div className="flex gap-2">
                    <button className="companion-bookmark" onClick={toggleBookmark}>
                        <Image 
                            src={`/icons/bookmark${bookmarked ? '-filled' : ''}.svg`} 
                            alt="bookmark" 
                            width={12.5} 
                            height={15}
                        />
                    </button>
                    <button className="companion-bookmark opacity-50 hover:opacity-100 transition-opacity" onClick={handleDelete}>
                        <Image 
                            src="/icons/trash.svg" 
                            alt="delete" 
                            width={12.5} 
                            height={15}
                            className="text-white"
                        />
                    </button>
                </div>
            </div>
            <h2 className="text-2xl font-bold">{name}</h2>
            <p className="text-sm">{topic}</p>
            <div className="flex items-center gap-2">
                    <Image src="/icons/clock.svg" alt="duration" width={12.5} height={13.5}/>
                    <p className="text-sm">{duration} minutes</p>

            </div>
            <Link href={`/companions/${id}`} className="w-full">
                <button className="btn-primary w-full justify-center">
                    Launch Lesson
                </button>
            </Link>
        </article>
    )
}
export default CompanionCard
