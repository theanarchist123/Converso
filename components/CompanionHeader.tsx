'use client'

import { useState, useEffect } from 'react';
import Image from "next/image";
import { getSubjectColor } from "@/lib/utils";

interface CompanionHeaderProps {
    name: string;
    subject: string;
    topic: string;
    duration: number;
}

export default function CompanionHeader({ name, subject, topic, duration }: CompanionHeaderProps) {
    const [bgColor, setBgColor] = useState(getSubjectColor(subject));
    
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
    
    return (
        <article className="flex rounded-border justify-between p-6 max-md:flex-col">
            <div className="flex items-center gap-2">
                <div 
                    className="size-[72px] flex items-center justify-center rounded-lg max-md:hidden transition-colors duration-300" 
                    style={{ backgroundColor: bgColor }}
                >
                    <Image src={`/icons/${subject}.svg`} alt={subject} width={35} height={35} />
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-2xl">
                            {name}
                        </p>
                        <div className="subject-badge max-sm:hidden">
                            {subject}
                        </div>
                    </div>
                    <p className="text-lg">{topic}</p>
                </div>
            </div>
            <div className="items-start text-2xl max-md:hidden">
                {duration} minutes
            </div>
        </article>
    );
}