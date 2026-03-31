'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Trophy, Zap, Crown, User as UserIcon } from 'lucide-react';
import { UserProfile } from '@/store/useUserStore';

export default function LeaderboardPage() {
    const [leaders, setLeaders] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(50));
                const snap = await getDocs(q);
                const data = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
                setLeaders(data);
            } catch (error) {
                console.error('Failed to fetch Matrix Kings:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeaders();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-black pt-12 md:pt-20 pb-24 px-4 sm:px-8">
            <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 md:gap-10 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-yellow-500/20 pb-6 relative">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-500/10 blur-[50px] rounded-full" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
                            <Trophy className="text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]" size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black font-bebas text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 tracking-widest uppercase drop-shadow-[0_2px_10px_rgba(234,179,8,0.4)] m-0 leading-none">
                                Matrix Kings
                            </h1>
                            <p className="font-mono text-[10px] md:text-xs text-yellow-500/60 uppercase tracking-[0.3em] font-black mt-2">
                                Tactical Experience Leaderboard
                            </p>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="w-full h-64 flex flex-col items-center justify-center gap-4 text-yellow-500/40">
                        <div className="w-8 h-8 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
                        <span className="font-mono text-[10px] uppercase tracking-widest">Compiling Matrix Hierarchy...</span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 relative z-10">
                        {leaders.map((pilot, idx) => (
                            <div 
                                key={pilot.uid} 
                                className={`flex items-center gap-4 p-4 border transition-all duration-300 ${
                                    idx === 0 ? 'bg-yellow-500/10 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.15)] scale-[1.02]' :
                                    idx === 1 ? 'bg-zinc-800/60 border-zinc-400/30' :
                                    idx === 2 ? 'bg-amber-900/30 border-amber-700/30' :
                                    'bg-[#050505] border-white/5 hover:border-yellow-500/20'
                                }`}
                                style={{
                                    clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)',
                                    animationDelay: `${idx * 50}ms`
                                }}
                            >
                                <div className="flex items-center justify-center w-8 shrink-0 font-bebas text-2xl md:text-3xl text-white/40 tracking-widest">
                                    {idx === 0 ? <Crown className="text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" size={24} /> : `#${idx + 1}`}
                                </div>

                                <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 bg-black border border-white/20 p-0.5" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}>
                                    <img 
                                        src={pilot.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${pilot.uid}`} 
                                        className="w-full h-full object-cover grayscale-[0.2]" 
                                        alt={pilot.displayName || 'Anon'} 
                                    />
                                </div>

                                <div className="flex-1 min-w-0 pr-4">
                                    <h3 className={`text-xl md:text-2xl font-bebas tracking-widest uppercase truncate ${idx === 0 ? 'text-yellow-400 font-black' : 'text-white'}`}>
                                        {pilot.displayName || 'UNREGISTERED PILOT'}
                                    </h3>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="font-mono text-[8px] md:text-[9px] text-gray-500 uppercase tracking-widest">
                                            LVL {Math.floor((pilot.xp || 0) / 1000) + 1}
                                        </span>
                                        {pilot.role === 'FOUNDER' && (
                                            <span className="font-mono text-[8px] bg-yellow-500/20 text-yellow-500 px-1.5 border border-yellow-500/30 uppercase tracking-widest">Founder</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 text-primary bg-primary/10 px-3 py-2 border border-primary/20 shrink-0">
                                    <Zap size={14} className="animate-pulse" />
                                    <span className="font-mono text-[10px] md:text-sm font-black tracking-widest uppercase">{pilot.xp?.toLocaleString() || 0} XP</span>
                                </div>
                            </div>
                        ))}

                        {leaders.length === 0 && (
                            <div className="w-full py-12 text-center border-2 border-dashed border-white/10 opacity-50">
                                <UserIcon size={32} className="mx-auto mb-4 text-white/30" />
                                <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">Leaderboard Data Unavailable</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* Visual Grid Background */}
            <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:50px_50px]" />
        </div>
    );
}
