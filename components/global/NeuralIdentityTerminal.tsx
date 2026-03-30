'use client';

import { useState, useEffect } from 'react';
import { Coins, Image as ImageIcon } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { auth, discordProvider } from '@/lib/firebase/config';
import { signInWithPopup, signOut } from 'firebase/auth';
import { CyberButton } from '@/components/ui/CyberButton';
import { getPilotRank } from '@/lib/utils/rankings';

export default function NeuralIdentityTerminal({ className = "" }: { className?: string }) {
    const { currentUser, passiveXpTrigger } = useUserStore();
    const [showPassiveXp, setShowPassiveXp] = useState(false);

    useEffect(() => {
        if (passiveXpTrigger > 0) {
            setShowPassiveXp(true);
            const timer = setTimeout(() => setShowPassiveXp(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [passiveXpTrigger]);

    const rankInfo = getPilotRank(currentUser?.xp || 0);

    return (
        <div className={`w-full animate-in slide-in-from-top duration-1000 z-50 ${className}`}>
           <div className="flex flex-wrap items-center justify-between border-y border-[#00ffff]/20 bg-black/40 backdrop-blur-2xl p-4 md:p-6 lg:p-8 rounded-none relative overflow-hidden group/terminal shadow-[0_0_30px_rgba(0,255,255,0.05)] gap-y-4 sm:gap-y-0">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/terminal:opacity-100 transition-opacity z-[1]" />
                
                {currentUser?.customBannerUrl && (
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-50 mix-blend-screen md:opacity-40 overflow-hidden">
                        <img 
                            src={currentUser.customBannerUrl} 
                            className="w-full h-full object-cover grayscale-[0.2] scale-105 transition-all duration-75 animate-[pulse_1.5s_ease-in-out_infinite]" 
                            style={{ filter: `contrast(1.2) brightness(var(--audio-intensity, 1))` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    </div>
                )}
                
                {/* Banner Reposition Icon */}
                <button 
                    onClick={() => alert("Banner Reposition Interface Offline")}
                    className="absolute top-4 right-4 z-[60] bg-black/60 border border-white/20 p-2 text-gray-500 hover:text-primary hover:border-primary transition-all rounded shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                    title="Edit Banner Layout"
                >
                    <ImageIcon size={16} />
                </button>
                
                {/* XP Floating Physics */}
                {showPassiveXp && (
                    <div className="absolute -top-4 right-[20%] font-mono text-[16px] text-yellow-400 font-black animate-bounce z-[100] drop-shadow-[0_0_12px_rgba(250,204,21,1)] pointer-events-none uppercase">
                        +15 XP
                    </div>
                )}
                
                {/* LEFT: FINANCIAL TELEMETRY */}
                <div className="flex items-center justify-start sm:justify-start gap-4 md:gap-12 relative z-10 w-1/2 sm:w-1/3 order-2 sm:order-1">
                    <div className="flex flex-col">
                        <span className="font-mono text-[8px] sm:text-[10px] text-[#00ffff]/70 uppercase tracking-[0.5em] font-black underline mb-1">Neural_Credits</span>
                        <div className="flex items-center gap-2 md:gap-3">
                            <Coins size={14} className="text-[#00ffff] animate-pulse hidden sm:block md:w-[18px] md:h-[18px]" />
                            <span className="font-bebas text-2xl sm:text-4xl md:text-5xl text-white tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">{currentUser?.coinsBalance?.toLocaleString() || '0'}C</span>
                        </div>
                    </div>
                    
                    <div className="hidden sm:flex flex-col">
                        <span className="font-mono text-[8px] sm:text-[10px] text-[#00ffff]/70 uppercase tracking-[0.5em] font-black underline mb-1">Rank_Protocol</span>
                        <div className="flex items-center gap-3">
                            <span className="font-bebas text-3xl sm:text-5xl text-[#00ffff] tracking-widest uppercase pb-1 leading-none">{currentUser?.role || 'NEURAL_PILOT'}</span>
                            <span className="font-mono text-[10px] bg-white/10 px-2 py-1 text-white tracking-[0.2em] font-black uppercase shadow-black drop-shadow-md border border-white/20">
                                LVL {rankInfo.level}
                            </span>
                            {rankInfo.prestige > 0 && (
                                <span className="font-mono text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-1 tracking-[0.2em] font-black uppercase border border-yellow-500/50">
                                    ★ {rankInfo.prestige}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                
            {/* CENTER: IDENTITY CORE */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 relative z-10 w-full sm:w-1/3 order-1 sm:order-2">
                {currentUser && !auth.currentUser?.isAnonymous ? (
                    <div className="flex items-center gap-3 sm:gap-6 group/profile cursor-pointer" onClick={() => signOut(auth)}>
                        <div className="flex flex-col items-end">
                            <span className="font-mono text-[6px] sm:text-[10px] text-[#00ffff]/70 uppercase tracking-[0.5em] font-black italic">Signature</span>
                            <span className="font-bebas text-4xl sm:text-5xl md:text-6xl text-white tracking-[0.1em] drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-colors">{currentUser.displayName?.toUpperCase()}</span>
                        </div>
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border border-[#00ffff]/30 p-1 bg-black/60 overflow-hidden shadow-[0_0_20px_rgba(0,255,255,0.1)] group-hover/profile:border-[#00ffff] group-hover/profile:shadow-[0_0_30px_rgba(0,255,255,0.4)] transition-all">
                            <img 
                                src={currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`} 
                                alt="Pilot" 
                                className="w-full h-full object-cover rounded-full grayscale group-hover/profile:grayscale-0 transition-all"
                            />
                        </div>
                    </div>
                    ) : (
                        <CyberButton 
                            text="ESTABLISH NEURAL LINK"
                            className="h-10 sm:h-12 px-6 sm:px-10 text-[9px] sm:text-[11px] rounded-none"
                            onClick={() => signInWithPopup(auth, discordProvider).catch(err => console.error(err))}
                        />
                    )}
                </div>

                {/* RIGHT: PERFORMANCE TELEMETRY */}
                <div className="flex items-center justify-end sm:justify-end gap-4 md:gap-12 relative z-10 w-1/2 sm:w-1/3 order-3 sm:order-3">
                    <div className="flex flex-col items-end">
                        <span className="font-mono text-[8px] sm:text-[10px] text-[#00ffff]/70 uppercase tracking-[0.5em] font-black underline mb-1">Neural_XP</span>
                        <span className="font-bebas text-2xl sm:text-4xl md:text-5xl text-white tracking-widest">{currentUser?.xp?.toLocaleString() || '0'} XP</span>
                    </div>
                    
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="font-mono text-[8px] sm:text-[10px] text-[#00ffff]/70 uppercase tracking-[0.5em] font-black underline mb-1">Leaderboard_Pos</span>
                        <span className="font-bebas text-3xl sm:text-5xl text-white tracking-widest drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]">#999+</span>
                    </div>
                    
                    <div className="hidden md:flex flex-col items-end">
                        <span className="font-mono text-[8px] sm:text-[10px] text-[#00ffff]/70 uppercase tracking-[0.5em] font-black underline mb-1">Rep_Points</span>
                        <span className="font-bebas text-3xl sm:text-5xl text-white tracking-widest">0 RP</span>
                    </div>
                </div>
           </div>
        </div>
    );
}
