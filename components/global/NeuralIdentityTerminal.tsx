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
           <div className="flex items-center justify-between border-y border-dashed border-[#ff00ff]/50 bg-black p-1 sm:p-2 rounded-none relative overflow-hidden group/terminal">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/terminal:opacity-100 transition-opacity" />
                
                {/* LEFT: FINANCIAL TELEMETRY */}
                <div className="flex items-center gap-4 md:gap-6 relative z-10 w-1/3 justify-start">
                    <div className="flex flex-col">
                        <span className="font-mono text-[5px] sm:text-[6px] text-[#ff00ff] uppercase tracking-[0.4em] font-black underline mb-0">Neural_Credits</span>
                        <div className="flex items-center gap-2">
                            <Coins size={12} className="text-[#00ffff] animate-pulse hidden sm:block" />
                            <span className="font-bebas text-lg sm:text-xl text-[#00ffff] tracking-widest drop-shadow-[0_0_5px_#00ffff]">{currentUser?.coinsBalance?.toLocaleString() || '0'}C</span>
                        </div>
                    </div>
                    
                    <div className="hidden sm:flex flex-col">
                        <span className="font-mono text-[6px] text-[#ff00ff] uppercase tracking-[0.4em] font-black underline mb-0">Rank_Protocol</span>
                        <span className="font-bebas text-xl text-[#00ffff] tracking-widest uppercase">{currentUser?.role || 'NEURAL_PILOT'}</span>
                    </div>
                </div>
                
                {/* CENTER: IDENTITY CORE */}
                <div className="flex items-center justify-center gap-2 sm:gap-4 relative z-10 w-1/3">
                    {currentUser && !auth.currentUser?.isAnonymous ? (
                        <div className="flex items-center gap-2 sm:gap-3 group/profile cursor-pointer" onClick={() => signOut(auth)}>
                            <div className="flex flex-col items-end">
                                <span className="font-mono text-[4px] sm:text-[6px] text-[#ff00ff] uppercase tracking-[0.4em] font-black italic">Signature</span>
                                <span className="font-bebas text-xl sm:text-3xl text-[#00ffff] tracking-[0.1em] drop-shadow-[0_0_8px_#00ffff] transition-colors">{currentUser.displayName?.toUpperCase()}</span>
                            </div>
                            <div className="relative w-8 h-8 sm:w-12 sm:h-12 rounded-none border border-dashed border-[#00ffff] p-0.5 bg-black overflow-hidden group-hover/profile:border-[#ff00ff] transition-colors shell-glow">
                                <img 
                                    src={currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`} 
                                    alt="Pilot" 
                                    className="w-full h-full object-cover grayscale opacity-80 group-hover/profile:grayscale-0 group-hover/profile:opacity-100 transition-all border border-dashed border-[#ff00ff]"
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
                <div className="flex items-center gap-4 md:gap-6 relative z-10 w-1/3 justify-end">
                    <div className="flex flex-col items-end">
                        <span className="font-mono text-[5px] sm:text-[6px] text-[#ff00ff] uppercase tracking-[0.4em] font-black underline mb-0">Neural_XP</span>
                        <span className="font-bebas text-lg sm:text-xl text-[#00ffff] tracking-widest">{currentUser?.xp?.toLocaleString() || '0'} XP</span>
                    </div>
                    
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="font-mono text-[6px] text-[#ff00ff] uppercase tracking-[0.4em] font-black underline mb-0">Leaderboard_Pos</span>
                        <span className="font-bebas text-xl text-[#00ffff] tracking-widest drop-shadow-[0_0_3px_#00ffff]">#999+</span>
                    </div>
                    
                    <div className="hidden md:flex flex-col items-end">
                        <span className="font-mono text-[6px] text-[#ff00ff] uppercase tracking-[0.4em] font-black underline mb-0">Rep_Points</span>
                        <span className="font-bebas text-xl text-[#ff00ff] tracking-widest">0 RP</span>
                    </div>
                </div>
           </div>
        </div>
    );
}
