'use client';

import { useUserStore } from '@/store/useUserStore';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import NeuralIdentityTerminal from '@/components/global/NeuralIdentityTerminal';

export default function PersistentProfile() {
    const { currentUser, userLoadState } = useUserStore();
    const pathname = usePathname();

    const isActive = pathname !== '/login' && !pathname?.startsWith('/pod') && currentUser && userLoadState === 'AUTHENTICATED';

    useEffect(() => {
        if (isActive) {
            document.documentElement.style.setProperty('--profile-offset', '160px');
        } else {
            document.documentElement.style.setProperty('--profile-offset', '0px');
        }
    }, [isActive]);

    if (!isActive) return null;

    return (
        <div className="w-full fixed top-[62px] left-0 z-[90] pointer-events-none animate-in slide-in-from-top duration-700">
            <NeuralIdentityTerminal className="pointer-events-auto border-b border-[#00ffff]/20 bg-black/60 backdrop-blur-2xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] rounded-none" />
        </div>
    );
}
