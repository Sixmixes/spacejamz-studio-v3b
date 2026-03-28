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
            <div className="w-full h-20 bg-black/40 border border-primary/20 rounded-xl flex items-center justify-center mb-6">
                <Loader2 className="animate-spin text-primary" size={24} />
            </div>
        );
    }

    // Unauthenticated State (Login Prompt)
    if (!currentUser || userLoadState === 'UNAUTHENTICATED') {
        return (
            <div className="w-full bg-black/60 border border-primary/30 rounded-xl p-4 md:p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_20px_rgba(var(--color-primary),0.1)] relative overflow-hidden group">
                {/* Scanner logic */}
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(var(--color-primary),0.05)_50%)] bg-[length:100%_4px] pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary/50 shadow-[0_0_15px_rgba(var(--color-primary),0.8)] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity group-hover:animate-scan" />

                <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
                    <div className="w-12 h-12 bg-black flex items-center justify-center border border-[#5865F2] shadow-[0_0_10px_rgba(88,101,242,0.4)]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}>
                        <span className="text-[#5865F2] font-black font-bebas text-2xl">D</span>
                    </div>
                    <div>
                        <h3 className="text-white font-bebas text-xl md:text-3xl tracking-widest uppercase m-0 leading-none">Identity Check Required</h3>
                        <p className="font-mono text-[9px] text-[#5865F2] tracking-[0.2em] uppercase mt-1">Authenticate via Discord to sync Neural Data</p>
                    </div>
                </div>

                <div className="flex flex-col md:items-end w-full md:w-auto gap-2 relative z-10">
                    <button 
                        onClick={triggerDiscordAuth}
                        disabled={isAuthenticating}
                        className="bg-[#5865F2] hover:bg-white text-white hover:text-[#5865F2] transition-colors px-6 py-3 font-mono font-bold text-[10px] md:text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(88,101,242,0.4)] cyber-button-clip w-full md:w-auto"
                    >
                        {isAuthenticating ? <Loader2 className="animate-spin" size={16} /> : <User size={16} />}
                        {isAuthenticating ? 'VERIFYING...' : 'LOGIN VIA DISCORD'}
                    </button>
                    {authError && <span className="text-red-500 font-mono text-[8.5px] uppercase tracking-widest text-center md:text-right">{authError}</span>}
                </div>
            </div>
        );
    }

    // Authenticated State (Identity Pod)
    return (
        <div className="w-full bg-black/60 border border-primary/30 rounded-xl p-4 md:p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(var(--color-primary),0.15)] relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
            
            {/* Left Box: Avatar and Identity */}
            <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
                <div className="relative">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-black border border-primary p-1 overflow-hidden cyber-button-clip group">
                        <img 
                            src={currentUser.photoURL || 'https://api.dicebear.com/7.x/identicon/svg?seed=pilot&backgroundColor=000000'} 
                            alt="Avatar" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-black border border-primary px-2 py-0.5 tracking-widest font-mono text-[8xs] md:text-[9px] text-primary uppercase cyber-button-clip">
                        LVL {Math.floor((currentUser.xp || 0) / 1000) + 1}
                    </div>
                </div>

                <div className="flex flex-col">
                    <h2 className="font-bebas text-2xl md:text-4xl text-white tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] m-0 leading-none">
                        {currentUser.displayName || 'UNKNOWN PILOT'}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="bg-primary/20 border border-primary/50 text-primary font-mono text-[8px] md:text-[9px] uppercase px-2 py-0.5 rounded tracking-widest shadow-[0_0_10px_rgba(var(--color-primary),0.3)]">
                            {currentUser.role || 'PILOT'}
                        </span>
                        {(currentUser.prestige_level || 0) > 0 && (
                            <span className="bg-yellow-500/20 text-yellow-400 font-mono text-[8px] md:text-[9px] uppercase px-2 py-0.5 rounded tracking-widest border border-yellow-500/40">
                                ★ PRESTIGE {currentUser.prestige_level}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Box: Metrics & Treasury Link */}
            <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto relative z-10 bg-black/40 p-3 md:p-4 border border-white/5 cyber-button-clip">
                <div className="flex items-center gap-4 md:gap-8">
                    <div className="flex flex-col border-r border-white/10 pr-4 md:pr-8">
                        <span className="font-mono text-[8xs] md:text-[9px] text-gray-500 tracking-widest uppercase mb-1">Matrix XP</span>
                        <div className="flex items-center gap-1.5 text-primary font-bebas text-xl md:text-2xl leading-none tracking-wider">
                            <Zap size={14} className="text-primary/70 shrink-0" />
                            {currentUser.xp?.toLocaleString() || '0'}
                        </div>
                    </div>
                    <div className="flex flex-col text-left cursor-pointer group px-2" onClick={() => router.push('/treasury')}>
                        <span className="font-mono text-[8xs] md:text-[9px] text-gray-500 tracking-widest uppercase mb-1 group-hover:text-yellow-500 transition-colors">Treasury</span>
                        <div className="flex items-center gap-1.5 text-yellow-400 font-bebas text-xl md:text-2xl leading-none tracking-wider group-hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] transition-all">
                            <CircleDollarSign size={14} className="text-yellow-500 shrink-0 group-hover:animate-pulse" />
                            {currentUser.coinsBalance?.toLocaleString() || '0'} C
                        </div>
                    </div>
                </div>
                
                {/* Actions */}
                <div className="flex flex-col gap-1 ml-2 border-l border-white/10 pl-4 space-y-2">
                    <button onClick={() => router.push('/treasury')} className="text-white hover:text-primary transition-colors hover:scale-110">
                        <ArrowRight size={18} />
                    </button>
                    <button onClick={handleLogout} className="text-gray-600 hover:text-red-500 transition-colors hover:scale-110" title="Sever Link">
                        <LogOut size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
