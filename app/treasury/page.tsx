"use client";

import React, { useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import { CircleDollarSign, Fingerprint, ChevronLeft, Zap, Trophy, Flame } from 'lucide-react';

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
        <div className="flex flex-col items-center justify-start min-h-screen pt-4 pb-24 relative overflow-hidden">
            
            {/* RETURN NAVIGATION */}
            <div className="w-[95%] max-w-7xl mx-auto mb-4 relative z-50">
                <button 
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 px-4 py-2 bg-black/60 border border-white/10 cyber-button-clip hover:bg-primary/20 hover:border-primary/50 text-gray-400 hover:text-white transition-all w-fit group"
                >
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bebas text-lg tracking-widest pt-1">RETURN TO ARCHITECT SUITE</span>
                </button>
            </div>

            <div className="cyber-panel p-6 md:p-12 w-[95%] max-w-7xl relative z-50 overflow-hidden desync-1">
                
                {/* Header Sequence */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-primary/20 pb-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-black border-2 border-yellow-500 rounded-full flex items-center justify-center p-2 relative shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                            <div className="absolute inset-0 rounded-full border border-yellow-400 animate-[spin_4s_linear_infinite] opacity-50" />
                            <CircleDollarSign className="text-yellow-500 w-full h-full" />
                        </div>
                        
                        <div className="flex flex-col">
                            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-[0.2em] font-bebas m-0 leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                                THE TREASURY
                            </h2>
                            <p className="font-mono text-[9px] md:text-[11px] text-yellow-500 tracking-[0.3em] uppercase mt-2">
                                Secure Token Ledger // Matrix Economy
                            </p>
                        </div>
                    </div>

                    <div className="bg-black/60 border border-yellow-500/30 px-6 py-4 flex flex-col items-end shadow-[0_0_20px_rgba(234,179,8,0.1)] rounded-xl cyber-button-clip">
                        <span className="font-mono text-[9px] text-gray-500 tracking-widest uppercase mb-1">Total Available Balance</span>
                        <div className="flex items-center gap-2 text-yellow-400 font-bebas text-4xl md:text-5xl tracking-widest leading-none drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]">
                            {currentUser.coinsBalance?.toLocaleString() || '0'} <span className="text-2xl pt-2">C</span>
                        </div>
                    </div>
                </div>

                {/* Account Status / Grants Log */}
                <h3 className="font-mono text-primary text-[10px] tracking-widest uppercase mb-4 pl-2 border-l-2 border-primary">Active Ledgers & Grants</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    
                    {/* FOUNDER STATUS */}
                    <div className={`cyber-card p-6 flex flex-col relative overflow-hidden group border ${hasFounderAirdrop ? 'border-yellow-500/50' : 'border-white/10'}`}>
                        {hasFounderAirdrop && <div className="absolute inset-0 bg-yellow-500/5 pointer-events-none" />}
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <Trophy className={hasFounderAirdrop ? "text-yellow-500" : "text-gray-600"} size={24} />
                            {hasFounderAirdrop ? (
                                <span className="font-mono text-[8px] tracking-widest text-black bg-yellow-500 px-2 py-0.5 rounded uppercase">CLAIMED</span>
                            ) : (
                                <span className="font-mono text-[8px] tracking-widest text-gray-500 border border-white/10 px-2 py-0.5 rounded uppercase">UNAVAILABLE</span>
                            )}
                        </div>
                        <h4 className="font-bebas text-2xl tracking-widest text-white uppercase m-0 z-10">Founder Airdrop</h4>
                        <p className="font-mono text-[9px] text-gray-400 mt-2 z-10">
                            The first 50 verified neural identities receive +5000 Coins as an initial operational grant.
                        </p>
                    </div>

                    {/* DAILY REFILL */}
                    <div className="cyber-card border border-primary/20 p-6 flex flex-col relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <Zap className="text-primary group-hover:scale-110 transition-transform" size={24} />
                            <span className="font-mono text-[8px] tracking-widest text-black bg-primary px-2 py-0.5 rounded disabled uppercase">AVAILABLE TOMORROW</span>
                        </div>
                        <h4 className="font-bebas text-2xl tracking-widest text-white uppercase m-0">Daily Operational Refill</h4>
                        <p className="font-mono text-[9px] text-gray-400 mt-2">
                            Logging in each day grants a 100 Coin passive deposit to sustain background processing matrix.
                        </p>
                    </div>

                    {/* COMPETITIVE EARNINGS */}
                    <div className="cyber-card border border-white/10 p-6 flex flex-col relative overflow-hidden group hover:border-red-500/50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <Flame className="text-red-500 group-hover:scale-110 transition-transform" size={24} />
                            <span className="font-mono text-[8px] tracking-widest text-red-500 border border-red-500/20 px-2 py-0.5 rounded uppercase">OFFLINE</span>
                        </div>
                        <h4 className="font-bebas text-2xl tracking-widest text-white uppercase m-0">Battle Winnings</h4>
                        <p className="font-mono text-[9px] text-gray-400 mt-2">
                            Deploy tracks into active combat zones. Coins are deposited symmetrically with crowd approval vectors.
                        </p>
                    </div>

                </div>

            </div>
        </div>
    );
}
