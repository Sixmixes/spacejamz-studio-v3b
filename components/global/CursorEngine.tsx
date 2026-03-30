'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';

export default function CursorEngine() {
    const { currentUser } = useUserStore();
    
    useEffect(() => {
        // The Architect Default
        let activeCursor = "crosshair"; 
        
        if (currentUser?.customCursor) {
            activeCursor = currentUser.customCursor;
        }

        const style = document.createElement('style');
        // Force the chosen cursor globally, maintaining pointer for interactive elements if its a basic cursor, otherwise force it aggressively.
        if (['crosshair', 'cell', 'default', 'crosshair', 'alias'].includes(activeCursor)) {
            style.innerHTML = `
                body { cursor: ${activeCursor} !important; }
                a, button, [role="button"] { cursor: pointer; }
            `;
        } else {
            // If they provided a URL image
            if (activeCursor.startsWith('url')) {
                 style.innerHTML = `
                    body, a, button, [role="button"], input, select, textarea { cursor: ${activeCursor}, auto !important; }
                `;
            } else {
                 style.innerHTML = `
                    body { cursor: ${activeCursor} !important; }
                    a, button, [role="button"] { cursor: ${activeCursor} !important; }
                `;
            }
        }
        
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, [currentUser?.customCursor]);

    return null;
}
