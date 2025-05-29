'use client'

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

const BookmarkFilter = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const isBookmarked = searchParams.get('bookmarked') === 'true';

    const toggleBookmarkFilter = () => {
        const params = new URLSearchParams(searchParams);
        if (isBookmarked) {
            params.delete('bookmarked');
        } else {
            params.set('bookmarked', 'true');
        }
        router.push(`/companions?${params.toString()}`);
    };

    return (        <button 
            onClick={toggleBookmarkFilter}
            className={`flex gap-2 items-center px-4 py-2 rounded-lg ${isBookmarked ? 'bg-primary/10 border-primary' : 'bg-white hover:bg-gray-50'} border`}
        >            <Image 
                src={`/icons/bookmark${isBookmarked ? '-filled' : ''}.svg`}
                alt="Bookmark filter"
                width={20}
                height={24}
                className={`${isBookmarked ? 'opacity-100' : 'opacity-90'}`}
            />
            <span>Bookmarked</span>
        </button>
    );
};

export default BookmarkFilter;
