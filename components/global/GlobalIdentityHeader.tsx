'use client';
import React from 'react';
import { useUserStore } from '@/store/useUserStore';
import { auth, discordProvider } from '@/lib/firebase/config';
import { signInWithPopup, signOut } from 'firebase/auth';
import { Award, Zap, Coins, LogOut } from 'lucide-react';
import { CyberAvatarModal } from '@/components/global/CyberAvatarModal';

export default function GlobalIdentityHeader() {
    const { currentUser, previewBannerUrl, previewBannerY, previewBannerZoom } = useUserStore();

    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, discordProvider);
        } catch (error) {
            console.error("Login bypass failed", error);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        useUserStore.getState().logout();
    };

    if (!currentUser) {
        return (
            <div className="relative w-full pb-0 md:pb-16 pt-[56px] md:pt-24 bg-zinc-900 overflow-hidden border-b border-white/10 group flex items-end shrink-0 animate-in fade-in duration-1000">
                <div className="absolute inset-0 z-0 bg-black">
                    <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(var(--color-primary),0.05)_0,transparent_100%)] flex items-center justify-center">
                        <span className="font-mono text-[8px] md:text-[10px] text-gray-700 uppercase tracking-[1em]">NO PILOT DETECTED</span>
                    </div>
                </div>
                
                <div className="relative z-10 w-full px-4 md:px-12 flex flex-row items-end text-left gap-3 md:gap-6 pb-2 md:pb-0">
                    <div className="w-16 h-16 md:w-32 md:h-32 bg-black border border-gray-500/40 md:border-2 p-0.5 md:p-1 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center shrink-0" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}>
                        <span className="font-mono text-[8px] sm:text-[10px] text-gray-600 uppercase tracking-widest leading-none mt-2">GUEST</span>
                    </div>
                    
                    <div className="flex flex-col items-start justify-end h-auto md:h-32 mb-0 mt-0 py-0 md:pb-2 md:pt-4 w-full">
                        <div className="flex items-center justify-between w-full max-w-full pr-4 md:pr-0 mb-1.5 md:mb-3">
                            <h1 className="text-xl md:text-5xl font-black font-bebas tracking-widest uppercase drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] leading-none text-gray-500 mt-0 truncate">
                                UNAUTHORIZED USER
                            </h1>
                        </div>
                        <button 
                            onClick={handleLogin}
                            className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-3 py-1 md:px-6 md:py-2.5 font-bebas text-xs md:text-xl tracking-widest flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(88,101,242,0.4)] hover:shadow-[0_0_30px_rgba(88,101,242,0.6)]"
                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}
                        >
                            CONNECT WITH DISCORD
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* MASSIVE PILOT BANNER (Dynamic GPU Art) */}
            <div className="relative w-full pb-0 md:pb-16 pt-[56px] md:pt-24 bg-zinc-900 overflow-hidden border-b border-white/10 group flex items-end shrink-0 animate-in fade-in duration-1000">
                <div className="absolute inset-0 z-0">
                    {(previewBannerUrl || currentUser.customBannerUrl) ? (
                        <div className="absolute inset-0 z-0 origin-center transition-transform duration-[10s] ease-linear group-hover:scale-105">
                            <img 
                                src={previewBannerUrl || currentUser.customBannerUrl} 
                                className="w-full h-full object-cover opacity-60" 
                                style={{
                                    objectPosition: `center ${previewBannerY ?? currentUser.bannerPositionY ?? 50}%`,
                                    transform: `scale(${previewBannerZoom ?? currentUser.bannerZoom ?? 1})`
                                }}
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(var(--color-primary),0.1)_0,transparent_100%)] flex items-center justify-center">
                            <span className="font-mono text-[10px] text-gray-700 uppercase tracking-[1em]">No Aesthetic Data Detected</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>
                
                {/* Profile Stats Floating Container */}
                <div className="relative z-10 w-full px-4 md:px-12 flex flex-row items-end text-left gap-3 md:gap-6 pb-0 md:pb-0">
                    <button 
                        popoverTarget="avatar-editor-modal"
                        className="relative group/avatar shrink-0 outline-none cursor-pointer hover:shadow-[0_0_80px_rgba(var(--color-primary),0.4)] transition-all duration-500 rounded-none focus:outline-none"
                    >
                        <div className="w-16 h-16 md:w-32 md:h-32 bg-black border border-primary md:border-2 p-0.5 md:p-1 overflow-hidden shadow-[0_0_50px_rgba(var(--color-primary),0.2)]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}>
                            <img src={currentUser.photoURL || 'https://api.dicebear.com/7.x/identicon/svg?seed=pilot'} className="w-full h-full object-cover group-hover/avatar:scale-110 group-hover/avatar:grayscale-[0.5] transition-all duration-500" />
                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                <span className="font-mono text-[6px] md:text-sm text-white uppercase tracking-widest font-black drop-shadow-md border border-white/20 bg-black/60 px-2 py-1">EDIT</span>
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 md:-bottom-3 md:-right-3 bg-primary text-black px-1.5 py-0 md:px-3 md:py-1 font-black font-bebas text-[9px] md:text-xl tracking-widest shadow-xl">
                            LVL {Math.floor((currentUser.xp || 0) / 1000) + 1}
                        </div>
                    </button>
                    
                    <div className="flex flex-col items-start justify-between h-auto md:h-32 mb-0 mt-0 py-0 md:py-2 w-full overflow-hidden">
                        <div className="flex items-center justify-between w-full max-w-full pr-4 md:pr-0">
                            <div className="flex items-center justify-start gap-2 md:gap-3">
                                <h1 className="text-xl md:text-5xl font-black font-bebas tracking-widest uppercase drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 mt-0 truncate">
                                    {currentUser.displayName || 'UNKNOWN PILOT'}
                                </h1>
                                {currentUser.role === 'FOUNDER' && <Award className="text-yellow-500 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)] w-4 h-4 md:w-6 md:h-6 shrink-0" />}
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="flex items-center justify-center gap-1 sm:gap-2 bg-black/60 hover:bg-red-500 text-red-500 hover:text-black border border-red-500/40 px-2 py-1 md:px-3 md:py-1.5 font-mono text-[8px] md:text-[10px] uppercase tracking-widest transition-colors shadow-sm ml-2 shrink-0 md:mr-8"
                            >
                                <LogOut size={12} className="md:w-3.5 md:h-3.5 w-3 h-3" /> <span className="hidden sm:inline">SIGN OUT</span>
                            </button>
                        </div>
                        <div className="flex flex-row justify-start items-center gap-2 md:gap-4 mt-1 md:mt-0 flex-nowrap overflow-x-auto w-full scrollbar-none pb-0">
                            <div className="flex items-center gap-1.5 font-mono text-[8px] md:text-xs text-primary bg-primary/10 px-1.5 py-0 md:px-3 md:py-1 border border-primary/20 tracking-widest uppercase whitespace-nowrap shrink-0">
                                <Zap size={10} className="md:w-3 md:h-3" /> {currentUser.xp?.toLocaleString() || '0'} Matrix XP
                            </div>
                            <div className="flex items-center gap-1.5 font-mono text-[8px] md:text-xs text-yellow-500 bg-yellow-500/10 px-1.5 py-0 md:px-3 md:py-1 border border-yellow-500/20 tracking-widest uppercase whitespace-nowrap shrink-0">
                                <Coins size={10} className="md:w-3 md:h-3" /> {currentUser.coinsBalance?.toLocaleString() || '0'} Treasury
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Injected dynamically to prevent layout bloat inside child nodes */}
            <CyberAvatarModal />
        </>
    );
}
