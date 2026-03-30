'use client';

import { useEffect, useState } from 'react';

export default function Template({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Utilizing a cinematic dissolve with slide-up effect using Tailwind Animate plugins
    // This provides a smooth crossfade effect across all route transitions
    return (
        <div 
            className={`w-full h-full flex flex-col flex-1 ${mounted ? 'animate-in fade-in zoom-in-[0.99] duration-700 ease-out fill-mode-forwards' : 'opacity-0'}`}
        >
            {children}
        </div>
    );
}
