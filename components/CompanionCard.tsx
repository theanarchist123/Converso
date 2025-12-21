'use client'

import React, { useState, useEffect } from 'react'
import Image from "next/image";
import Link from "next/link";
import { addBookmark, removeBookmark, deleteCompanion } from "@/lib/actions/companion.client";
import { usePathname, useRouter } from "next/navigation";
import { getSubjectColor } from "@/lib/utils";

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
    const router = useRouter();
    const [isDeleted, setIsDeleted] = useState(false);
    const [bgColor, setBgColor] = useState(color);
    
    // Update color when theme changes
    useEffect(() => {
        const updateColor = () => {
            setBgColor(getSubjectColor(subject));
        };
        
        updateColor();
        
        // Listen for theme changes
        const observer = new MutationObserver(updateColor);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
        
        return () => observer.disconnect();
    }, [subject]);
    
    // If the component is deleted, don't render anything
    if (isDeleted) {
        return null;
    }

    const toggleBookmark = async () => {
        try {
            if (bookmarked) {
                await removeBookmark(id);
            } else {
                await addBookmark(id, pathname);
            }
            // Force refresh the current page to update UI
            router.refresh();
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this companion? This action cannot be undone.')) {
            try {
                await deleteCompanion(id);
                // Remove the card from UI immediately
                setIsDeleted(true);
                // Also refresh the page data to ensure it's updated on the server
                router.refresh();
            } catch (error) {
                console.error('Error deleting companion:', error);
                alert('Failed to delete companion. Please try again.');
            }
        }
    };

    return (
        <article className="companion-card transition-colors duration-300" style={{backgroundColor: bgColor}}>
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
                    <button className="companion-bookmark opacity-100 hover:opacity-80 transition-opacity" onClick={handleDelete}>
                        <Image 
                            src="/icons/trash.svg" 
                            alt="delete" 
                            width={12.5} 
                            height={15}
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
