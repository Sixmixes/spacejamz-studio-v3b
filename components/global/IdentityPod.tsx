"use client";

import React, { useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { auth } from '@/lib/firebase/config';
import { signInWithPopup, OAuthProvider } from 'firebase/auth';
import { Loader2, Zap, CircleDollarSign, LogOut, ArrowRight, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function IdentityPod() {
    const router = useRouter();
    const { currentUser, userLoadState, logout } = useUserStore();
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [authError, setAuthError] = useState('');

    const triggerDiscordAuth = async () => {
        setIsAuthenticating(true);
        setAuthError('');
        try {
            const provider = new OAuthProvider('oidc.discord');
            await signInWithPopup(auth, provider);
        } catch (error: any) {
            console.error("Discord Auth Failed", error);
            setAuthError(error.message || "Failed to establish a secure link with Discord.");
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleLogout = () => {
        logout();
        auth.signOut();
    };

    // If still parsing Firebase state on load
    if (userLoadState === 'LOADING' || userLoadState === 'IDLE') {
        return (
            <div className="w-full h-16 bg-black/40 border-y border-primary/20 flex items-center justify-center mb-6">
                <Loader2 className="animate-spin text-primary" size={20} />
            </div>
        );
    }

    // Unauthenticated State (Login Prompt)
    if (!currentUser || userLoadState === 'UNAUTHENTICATED') {
        return (
            <div className="w-full bg-black/80 border-y md:border border-primary/30 md:rounded-sm p-4 md:px-8 md:py-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_20px_rgba(var(--color-primary),0.1)] relative overflow-hidden group">
                {/* Scanner logic */}
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(var(--color-primary),0.05)_50%)] bg-[length:100%_4px] pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary/50 shadow-[0_0_15px_rgba(var(--color-primary),0.8)] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity group-hover:animate-scan" />

                <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-black flex items-center justify-center border border-[#5865F2] shadow-[0_0_10px_rgba(88,101,242,0.4)]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}>
                        <span className="text-[#5865F2] font-black font-bebas text-xl md:text-3xl">D</span>
                    </div>
                    <div>
                        <h3 className="text-white font-bebas text-xl md:text-3xl tracking-widest uppercase m-0 leading-none">Identity Check Required</h3>
                        <p className="font-mono text-[9px] md:text-[10px] text-[#5865F2] tracking-[0.2em] md:tracking-[0.4em] uppercase mt-1">Authenticate via Discord to sync Neural Data</p>
                    </div>
                </div>

                <div className="flex flex-col md:items-end w-full md:w-auto gap-2 relative z-10">
                    <button 
                        onClick={triggerDiscordAuth}
                        disabled={isAuthenticating}
                        className="bg-[#5865F2] hover:bg-white text-white hover:text-[#5865F2] transition-colors px-6 py-3 font-mono font-bold text-[10px] md:text-[11px] tracking-widest uppercase flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(88,101,242,0.4)] w-full md:w-auto"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}
                    >
                        {isAuthenticating ? <Loader2 className="animate-spin" size={16} /> : <User size={16} />}
                        {isAuthenticating ? 'VERIFYING...' : 'LOGIN VIA DISCORD'}
                    </button>
                    {authError && <span className="text-red-500 font-mono text-[8.5px] uppercase tracking-widest text-center md:text-right">{authError}</span>}
                </div>
            </div>
        );
    }

    // Authenticated State (Full Desktop Width Dashboard)
    return (
        <div className="w-full bg-black/80 border-y md:border border-primary/30 md:rounded-sm p-4 md:px-8 md:py-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 shadow-[0_0_30px_rgba(var(--color-primary),0.15)] relative overflow-hidden backdrop-blur-md">
            {/* Background elements */}
            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
            <div className="absolute top-0 left-0 w-1/3 h-[1px] bg-gradient-to-r from-primary to-transparent" />
            <div className="absolute bottom-0 right-0 w-1/3 h-[1px] bg-gradient-to-l from-primary to-transparent" />
            
            {/* Left Sector: Avatar and Identification (Stretched Left) */}
            <div className="flex flex-1 items-center gap-4 md:gap-6 relative z-10 w-full md:w-auto justify-start">
                <div className="relative shrink-0">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-black border border-primary p-0.5 overflow-hidden group" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}>
                        <img 
                            src={currentUser.photoURL || 'https://api.dicebear.com/7.x/identicon/svg?seed=pilot&backgroundColor=000000'} 
                            alt="Avatar" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-black border border-primary px-2 py-0.5 tracking-widest font-mono text-[8xs] md:text-[9px] text-primary uppercase shadow-[0_0_10px_rgba(var(--color-primary),0.5)]">
                        LVL {Math.floor((currentUser.xp || 0) / 1000) + 1}
                    </div>
                </div>

                <div className="flex flex-col">
                    <h2 className="font-bebas text-2xl md:text-3xl lg:text-4xl text-white tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] m-0 leading-none">
                        {currentUser.displayName || 'UNKNOWN PILOT'}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-primary font-mono text-[9px] md:text-[10px] uppercase tracking-[0.3em] cyber-flicker-slow">
                            [ {currentUser.role || 'GUEST OPERATIVE'} ]
                        </span>
                        {(currentUser.prestige_level || 0) > 0 && (
                            <span className="bg-yellow-500/10 text-yellow-400 font-mono text-[8px] md:text-[9px] uppercase px-1.5 py-0.5 rounded tracking-widest border border-yellow-500/20">
                                ★ PRESTIGE {currentUser.prestige_level}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Center / Right Sector: Distributed Metrics */}
            <div className="flex flex-wrap md:flex-nowrap items-center justify-between md:justify-end gap-6 md:gap-10 w-full md:w-auto relative z-10 border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
                
                {/* Metric 1: XP */}
                <div className="flex flex-col text-left md:text-right md:border-r border-white/10 md:pr-8 flex-1 md:flex-none">
                    <span className="font-mono text-[9px] md:text-[10px] text-gray-400 tracking-[0.3em] uppercase mb-1">Matrix XP</span>
                    <div className="flex items-center md:justify-end gap-2 text-primary font-bebas text-2xl md:text-3xl leading-none tracking-wider">
                        <Zap size={16} className="text-primary/70 shrink-0" />
                        {currentUser.xp?.toLocaleString() || '0'}
                    </div>
                </div>

                {/* Metric 2: Treasury */}
                <div className="flex flex-col text-right cursor-pointer group flex-1 md:flex-none" onClick={() => router.push('/treasury')}>
                    <span className="font-mono text-[9px] md:text-[10px] text-gray-400 tracking-[0.3em] uppercase mb-1 group-hover:text-yellow-500 transition-colors">Treasury</span>
                    <div className="flex items-center justify-end gap-2 text-yellow-500 font-bebas text-2xl md:text-3xl leading-none tracking-wider group-hover:drop-shadow-[0_0_15px_rgba(250,204,21,0.4)] transition-all">
                        <CircleDollarSign size={16} className="text-yellow-500 shrink-0 group-hover:animate-pulse" />
                        {currentUser.coinsBalance?.toLocaleString() || '0'} C
                    </div>
                </div>
                
                {/* Actions: Right edge */}
                <div className="flex items-center gap-3 ml-2 md:border-l border-white/10 md:pl-6">
                    <button onClick={() => router.push('/treasury')} className="w-10 h-10 flex items-center justify-center border border-white/10 bg-black hover:bg-white/5 text-white hover:text-primary transition-all hover:scale-110" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}>
                        <ArrowRight size={16} />
                    </button>
                    <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center border border-red-500/20 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white transition-all hover:scale-110" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }} title="Sever Link">
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
