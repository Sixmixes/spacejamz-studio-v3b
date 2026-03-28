'use client';
import React, { useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';

export default function SpaceThemeWrapper({ children }: { children: React.ReactNode }) {
    const { activeTheme } = useThemeStore();

    useEffect(() => {
        // Sync the theme class to the document body for CSS variable inheritance
        const html = document.documentElement;
        html.className = ''; // Reset
        html.classList.add(`theme-${activeTheme}`);
    }, [activeTheme]);

    return (
        <div className={`contents theme-${activeTheme}`}>
            {children}
        </div>
    );
}
