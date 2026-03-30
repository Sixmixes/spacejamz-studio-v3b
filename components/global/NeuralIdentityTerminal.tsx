'use client';

import { Coins } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { auth, discordProvider } from '@/lib/firebase/config';
import { signInWithPopup, signOut } from 'firebase/auth';
import { CyberButton } from '@/components/ui/CyberButton';

export default function NeuralIdentityTerminal({ className = "" }: { className?: string }) {
    const { currentUser } = useUserStore();

    return (
        <div className={`w-full animate-in slide-in-from-top duration-1000 z-50 ${className}`}>
           <div className="flex items-center justify-between border-y border-[#00ffff]/20 bg-black/40 backdrop-blur-2xl p-4 sm:p-8 rounded-none relative overflow-hidden group/terminal min-h-[160px] shadow-[0_0_30px_rgba(0,255,255,0.05)]">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/terminal:opacity-100 transition-opacity" />
                
                {/* LEFT: FINANCIAL TELEMETRY */}
                <div className="flex items-center gap-6 md:gap-12 relative z-10 w-1/3 justify-start">
                    <div className="flex flex-col">
                        <span className="font-mono text-[8px] sm:text-[10px] text-[#00ffff]/70 uppercase tracking-[0.5em] font-black underline mb-1">Neural_Credits</span>
                        <div className="flex items-center gap-3">
                            <Coins size={18} className="text-[#00ffff] animate-pulse hidden sm:block" />
                            <span className="font-bebas text-3xl sm:text-5xl text-white tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">{currentUser?.coinsBalance?.toLocaleString() || '0'}C</span>
                        </div>
                    </div>
                    
                    <div className="hidden sm:flex flex-col">
                        <span className="font-mono text-[8px] sm:text-[10px] text-[#00ffff]/70 uppercase tracking-[0.5em] font-black underline mb-1">Rank_Protocol</span>
                        <span className="font-bebas text-3xl sm:text-5xl text-[#00ffff] tracking-widest uppercase pb-1">{currentUser?.role || 'NEURAL_PILOT'}</span>
                    </div>
                </div>
                
            {/* CENTER: IDENTITY CORE */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 relative z-10 w-1/3">
                {currentUser && !auth.currentUser?.isAnonymous ? (
                    <div className="flex items-center gap-4 sm:gap-6 group/profile cursor-pointer" onClick={() => signOut(auth)}>
                        <div className="flex flex-col items-end">
                            <span className="font-mono text-[6px] sm:text-[10px] text-[#00ffff]/70 uppercase tracking-[0.5em] font-black italic">Signature</span>
                            <span className="font-bebas text-3xl sm:text-6xl text-white tracking-[0.1em] drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-colors">{currentUser.displayName?.toUpperCase()}</span>
                        </div>
                        <div className="relative w-14 h-14 sm:w-24 sm:h-24 rounded-full border border-[#00ffff]/30 p-1 bg-black/60 overflow-hidden shadow-[0_0_20px_rgba(0,255,255,0.1)] group-hover/profile:border-[#00ffff] group-hover/profile:shadow-[0_0_30px_rgba(0,255,255,0.4)] transition-all">
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
                <div className="flex items-center gap-6 md:gap-12 relative z-10 w-1/3 justify-end">
                    <div className="flex flex-col items-end">
                        <span className="font-mono text-[8px] sm:text-[10px] text-[#00ffff]/70 uppercase tracking-[0.5em] font-black underline mb-1">Neural_XP</span>
                        <span className="font-bebas text-3xl sm:text-5xl text-white tracking-widest">{currentUser?.xp?.toLocaleString() || '0'} XP</span>
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
