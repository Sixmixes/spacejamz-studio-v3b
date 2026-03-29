"use client";

import React, { useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import { CircleDollarSign, Fingerprint, ChevronLeft, Zap, Trophy, Flame } from 'lucide-react';
import NeuralIdentityTerminal from '@/components/global/NeuralIdentityTerminal';

export default function TreasuryPage() {
    const router = useRouter();
    const { currentUser, userLoadState } = useUserStore();

    useEffect(() => {
        if (userLoadState === 'UNAUTHENTICATED') {
            router.push('/');
        }
    }, [userLoadState, router]);

    if (!currentUser) {
        return <div className="min-h-screen bg-black" />; // Waiting for redirect
    }

    const hasFounderAirdrop = (currentUser.coinsBalance || 0) >= 5000;

    return (
        <div className="flex flex-col items-center justify-start min-h-screen pt-8 pb-40 relative overflow-hidden bg-black/95 group/main selection:bg-yellow-500/20">
            
            {/* CRT Persistent Filter Overlay */}
            <div className="absolute inset-0 pointer-events-none z-[40] opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(var(--color-primary),0.04),rgba(var(--color-primary),0.01),rgba(var(--color-primary),0.04))] bg-[length:100%_4px,4px_100%] animate-pulse" />
            
            {/* AMBIENT BACKGROUND FX */}
            <div className="fixed inset-0 pointer-events-none opacity-40 z-0 overflow-hidden mix-blend-screen">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[1200px] max-h-[1200px] rounded-full bg-yellow-900/10 blur-[180px] animate-pulse" />
                <div className="absolute top-[20%] right-[10%] w-96 h-96 bg-yellow-500/5 blur-[100px] rounded-full animate-bounce duration-[8s]" />
                <div className="absolute bottom-[20%] left-[10%] w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
            </div>

            <div className="w-[95%] max-w-7xl mx-auto z-[60] mt-12 mb-8">
                <NeuralIdentityTerminal />
            </div>

            {/* RETURN NAVIGATION */}
            <div className="w-[95%] max-w-7xl mx-auto mb-10 relative z-50 animate-in slide-in-from-top-4 duration-700">
                <button 
                    onClick={() => router.push('/')}
                    className="flex items-center gap-3 px-6 py-3 bg-black/80 border border-white/5 cyber-button-clip hover:bg-primary/20 hover:border-primary/50 text-gray-500 hover:text-white transition-all w-fit group shadow-[0_5px_20px_rgba(0,0,0,0.8)]"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                >
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform text-primary" />
                    <span className="font-bebas text-xl tracking-[0.2em] pt-1">RETURN TO ARCHITECT CORE</span>
                </button>
            </div>

            <div className="cyber-panel p-8 md:p-16 w-[95%] max-w-7xl relative z-50 overflow-hidden desync-1 bg-black/80 border-2 border-primary/20 shadow-[0_30px_100px_rgba(0,0,0,1)] rounded-[40px]"
                 style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 50px), calc(100% - 50px) 100%, 0 100%)' }}>
                
                {/* TACTICAL HUD METRICS */}
                <div className="absolute top-6 left-8 flex flex-col gap-1 opacity-20">
                    <span className="font-mono text-[7px] text-primary tracking-[0.5em] font-black uppercase italic">Ledger_Sync: ACTIVE</span>
                    <div className="w-16 h-0.5 bg-primary/40" />
                </div>
                
                {/* Header Sequence */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16 border-b border-primary/10 pb-12 relative">
                    <div className="flex items-center gap-8">
                        <div className="w-20 h-20 md:w-28 md:h-28 bg-[#0a0a0a] border-2 border-yellow-500/40 rounded-full flex items-center justify-center p-3 relative shadow-[0_0_50px_rgba(234,179,8,0.2)] group hover:scale-105 transition-transform duration-700">
                            <div className="absolute inset-0 rounded-full border-2 border-yellow-500/20 animate-[spin_8s_linear_infinite]" />
                            <div className="absolute -inset-2 rounded-full border border-yellow-500 animate-[spin_12s_linear_infinite_reverse] opacity-20" />
                            <CircleDollarSign className="text-yellow-500 w-full h-full drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                        </div>
                        
                        <div className="flex flex-col">
                            <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-[0.3em] font-bebas m-0 leading-tight drop-shadow-[0_5px_20px_rgba(0,0,0,0.8)] italic">
                                THE <span className="text-yellow-500">TREASURY</span>
                            </h2>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="w-4 h-4 bg-yellow-500/20 border border-yellow-500 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-yellow-500 animate-pulse" />
                                </div>
                                <p className="font-mono text-[10px] md:text-[12px] text-gray-500 tracking-[0.4em] uppercase font-bold italic">
                                    Secure Token Ledger // Matrix Economy
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-black/90 border-2 border-yellow-500/20 px-10 py-6 flex flex-col items-end shadow-[0_20px_40px_rgba(0,0,0,0.6)] rounded-2xl relative overflow-hidden group/balance" 
                         style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)' }}>
                        <div className="absolute inset-0 bg-yellow-500/5 translate-y-full group-hover/balance:translate-y-0 transition-transform duration-700" />
                        <span className="font-mono text-[9px] text-gray-500 tracking-[0.4em] uppercase mb-1 font-bold relative z-10">Available Balance</span>
                        <div className="flex items-center gap-3 text-yellow-400 font-bebas text-5xl md:text-7xl tracking-[0.1em] leading-none drop-shadow-[0_0_30px_rgba(234,179,8,0.4)] relative z-10 italic">
                            {currentUser.coinsBalance?.toLocaleString() || '0'} <span className="text-3xl pt-4">C</span>
                        </div>
                    </div>
                </div>

                {/* Account Status / Grants Log */}
                <div className="flex items-center gap-6 mb-10 pl-2">
                    <h3 className="font-mono text-primary text-[11px] tracking-[0.5em] uppercase font-black italic">Active Ledgers & Grants</h3>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-primary/40 to-transparent" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8 relative z-20">
                    
                    {/* FOUNDER STATUS */}
                    <div className={`p-8 flex flex-col relative overflow-hidden group border-2 transition-all duration-700 shadow-[0_15px_40px_rgba(0,0,0,0.8)] hover:scale-[1.02] ${hasFounderAirdrop ? 'border-yellow-500/40 bg-yellow-500/5' : 'border-white/5 bg-[#050505]'}`}
                         style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 25px), calc(100% - 25px) 100%, 0 100%)' }}>
                        <div className="flex justify-between items-start mb-10 relative z-10">
                            <div className={`p-4 rounded-lg bg-black/80 border ${hasFounderAirdrop ? 'border-yellow-500 text-yellow-500' : 'border-white/10 text-gray-700'}`}>
                                <Trophy size={28} className={hasFounderAirdrop ? "animate-pulse" : ""} />
                            </div>
                            {hasFounderAirdrop ? (
                                <span className="font-mono text-[9px] tracking-[0.3em] text-black bg-yellow-500 px-3 py-1 font-black italic">STATUS: CLAIMED</span>
                            ) : (
                                <span className="font-mono text-[9px] tracking-[0.3em] text-gray-500 border border-white/10 bg-black/60 px-3 py-1 font-black italic">STATUS: UNAVAILABLE</span>
                            )}
                        </div>
                        <h4 className="font-bebas text-3xl tracking-[0.2em] text-white uppercase m-0 z-10 italic">Founder Airdrop</h4>
                        <p className="font-mono text-[10px] text-gray-500 mt-4 z-10 leading-relaxed tracking-wider uppercase font-bold group-hover:text-gray-300 transition-colors">
                            The first 50 verified neural identities receive +5000 Coins as an initial operational grant.
                        </p>
                        <div className="absolute bottom-0 left-0 h-1 bg-yellow-500 w-0 group-hover:w-full transition-all duration-700" />
                    </div>

                    {/* DAILY REFILL */}
                    <div className="p-8 flex flex-col relative overflow-hidden group border-2 border-white/5 bg-[#050505] transition-all duration-700 shadow-[0_15px_40px_rgba(0,0,0,0.8)] hover:scale-[1.02] hover:border-primary/40"
                         style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 25px), calc(100% - 25px) 100%, 0 100%)' }}>
                        <div className="flex justify-between items-start mb-10 relative z-10">
                            <div className="p-4 rounded-lg bg-black/80 border border-primary text-primary">
                                <Zap size={28} className="animate-pulse" />
                            </div>
                            <span className="font-mono text-[9px] tracking-[0.3em] text-black bg-primary px-3 py-1 font-black italic">STATUS: ACTIVE</span>
                        </div>
                        <h4 className="font-bebas text-3xl tracking-[0.2em] text-white uppercase m-0 italic">Operational Refill</h4>
                        <p className="font-mono text-[10px] text-gray-500 mt-4 leading-relaxed tracking-wider uppercase font-bold group-hover:text-gray-300 transition-colors">
                            DAILY RECOGNITION: BALANCE {"<"} 100 C RESET TO 100 C. CONTINUOUS UPTIME ENSURED.
                        </p>
                        <div className="absolute bottom-0 left-0 h-1 bg-primary w-0 group-hover:w-full transition-all duration-700" />
                    </div>

                    {/* COMPETITIVE EARNINGS */}
                    <div className="p-8 flex flex-col relative overflow-hidden group border-2 border-white/5 bg-[#050505] transition-all duration-700 shadow-[0_15px_40px_rgba(0,0,0,0.8)] hover:scale-[1.02] hover:border-red-500/40"
                         style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 25px), calc(100% - 25px) 100%, 0 100%)' }}>
                        <div className="flex justify-between items-start mb-10 relative z-10">
                            <div className="p-4 rounded-lg bg-black/80 border border-red-500 text-red-500">
                                <Flame size={28} />
                            </div>
                            <span className="font-mono text-[9px] tracking-[0.3em] text-red-500 border border-red-500/20 bg-black/60 px-3 py-1 font-black italic">STATUS: OFFLINE</span>
                        </div>
                        <h4 className="font-bebas text-3xl tracking-[0.2em] text-white uppercase m-0 italic">Battle Winnings</h4>
                        <p className="font-mono text-[10px] text-gray-500 mt-4 leading-relaxed tracking-wider uppercase font-bold group-hover:text-gray-300 transition-colors">
                            Deploy tracks into active combat zones. Coins are deposited symmetrically with crowd approval vectors.
                        </p>
                        <div className="absolute bottom-0 left-0 h-1 bg-red-500 w-0 group-hover:w-full transition-all duration-700" />
                    </div>

                </div>

            </div>

            {/* SYSTEM OVERLAY */}
            <div className="absolute bottom-8 left-12 flex flex-col gap-1 z-50">
                <span className="font-mono text-[8px] text-primary/40 uppercase tracking-[0.5em] font-black">Treasury_Ledger_PT_04</span>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                    <span className="font-mono text-[10px] text-primary uppercase font-black italic">Archiving Secure Blocks...</span>
                </div>
            </div>
        </div>
    );
}
