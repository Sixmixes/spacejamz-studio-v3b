'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useUserStore } from '@/store/useUserStore';
import { Play, Flame, Trash2, ArrowUp, DollarSign, Clock, Zap, ShieldAlert, Cpu } from 'lucide-react';
import { ScrambleText } from '@/components/ui/ScrambleText';

interface StreamerQueueProps {
    streamerId: string;
}

interface QueueTrack {
    id: string;
    url: string;
    submittedBy: string;
    submitterName?: string;
    timestamp: any;
    bumpTokenAmount: number;
    status: 'pending' | 'playing' | 'played';
}

export default function StreamerQueue({ streamerId }: StreamerQueueProps) {
    const [queue, setQueue] = useState<QueueTrack[]>([]);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const currentUser = useUserStore(state => state.currentUser);
    const isArchitect = useUserStore(state => state.isArchitect);

    const isHost = currentUser?.uid === streamerId || isArchitect;

    useEffect(() => {
        if (!streamerId) return;

        const q = query(collection(db, `streamer_queues/${streamerId}/tracks`), orderBy('status', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tracks: QueueTrack[] = [];
            snapshot.forEach(d => {
                tracks.push({ id: d.id, ...d.data() } as QueueTrack);
            });

            // Complex JS sorting: Pending first. Then BumpTokens DESC, Timestamp ASC.
            const sortedTracks = tracks.filter(t => t.status !== 'played').sort((a, b) => {
                if (b.bumpTokenAmount !== a.bumpTokenAmount) {
                    return b.bumpTokenAmount - a.bumpTokenAmount;
                }
                const aTime = a.timestamp?.toMillis() || Date.now();
                const bTime = b.timestamp?.toMillis() || Date.now();
                return aTime - bTime;
            });

            setQueue(sortedTracks);
        });

        return () => unsubscribe();
    }, [streamerId]);

    const playTrack = async (track: QueueTrack) => {
        if (!isHost) return;
        const ref = doc(db, `streamer_queues/${streamerId}/tracks`, track.id);
        await updateDoc(ref, { status: 'playing' });
    };

    const finishTrack = async (track: QueueTrack) => {
        if (!isHost) return;
        const ref = doc(db, `streamer_queues/${streamerId}/tracks`, track.id);
        await updateDoc(ref, { status: 'played' });
    };

    const deleteTrack = async (trackId: string) => {
        if (!isHost) return;
        const ref = doc(db, `streamer_queues/${streamerId}/tracks`, trackId);
        await deleteDoc(ref);
    };

    // EVOLVED: Stripe Bump Token Checkout Flow
    const bumpTrack = async (track: QueueTrack) => {
        if (!currentUser) return alert("Must be logged in to bump tracks!");
        
        setIsCheckingOut(true);
        try {
            const response = await fetch('/api/stripe/bump-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    streamerId,
                    trackId: track.id,
                    amount: 1, // Number of bump tokens
                    streamerStripeAccountId: process.env.NEXT_PUBLIC_MOCK_STREAMER_ACCOUNT_ID
                }),
            });

            const data = await response.json();
            if (data.url) {
                // Redirect user to Stripe Checkout
                window.location.href = data.url;
            } else {
                alert('Stripe Route Error: ' + data.error);
                setIsCheckingOut(false);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to initialize checkout.');
            setIsCheckingOut(false);
        }
    };

    return (
        <div className="w-full bg-black/80 backdrop-blur-3xl border border-primary/20 shadow-[0_0_50px_rgba(var(--color-primary),0.05)] relative overflow-hidden group">
            {/* Tactical Scanline Effects */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(var(--color-primary),0.06),rgba(var(--color-primary),0.02),rgba(var(--color-primary),0.06))] z-10 bg-[length:100%_2px,3px_100%] animate-pulse" />
            
            <div className="relative z-20 bg-primary/10 border-b border-primary/20 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-none animate-pulse shadow-[0_0_10px_rgba(var(--color-primary),0.8)]" />
                    <h3 className="font-bebas text-2xl text-white tracking-[0.2em] italic uppercase drop-shadow-[0_0_5px_rgba(var(--color-primary),0.5)] flex items-center gap-2">
                        LIVE QUEUE <span className="opacity-40">|</span> <ScrambleText text={streamerId.split('-')[0] || "NODE_01"} scrambleSpeed={80} duration={1200} />
                    </h3>
                </div>
                
                <div className="font-mono text-[9px] text-primary tracking-[0.3em] font-black uppercase flex items-center gap-2 border border-primary/30 px-3 py-1 bg-black/40">
                    <Cpu size={10} className="text-primary cyber-flicker-fast" />
                    {queue.length} TARGETS
                </div>
            </div>

            <div className="p-4 flex flex-col gap-2 max-h-[500px] overflow-y-auto no-scrollbar relative z-20">
                {queue.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center opacity-40 border border-dashed border-primary/20 bg-black/40 transition-opacity hover:opacity-100 group">
                        <ShieldAlert size={28} className="text-primary mb-3 cyber-flicker-slow" />
                        <span className="font-mono text-[11px] text-white tracking-[0.4em] uppercase font-bold text-center">No Signals Detected</span>
                        <span className="font-mono text-[8px] text-primary/60 tracking-widest mt-2 uppercase">Awaiting External SC / Spotify Handshake</span>
                    </div>
                ) : (
                    queue.map((track, idx) => {
                        const isPlaying = track.status === 'playing';
                        const isTop = idx === 0 && !isPlaying;
                        return (
                            <div key={track.id} 
                                 className={`flex items-center gap-4 p-4 transition-all duration-500 overflow-hidden relative group/track
                                 ${isPlaying ? 'bg-primary/10 border-l-[4px] border-l-primary border-t border-r border-b border-primary/20 shadow-[0_0_20px_rgba(var(--color-primary),0.1)]' : 
                                   isTop ? 'bg-white/5 border border-primary/40' : 'bg-black/90 border border-white/5 hover:border-primary/20'}`}>
                                
                                {isPlaying && (
                                   <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-20 animate-pulse pointer-events-none" />
                                )}

                                {/* Rank/Status Indicator */}
                                <div className={`w-10 h-10 border flex flex-col items-center justify-center shrink-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]
                                    ${isPlaying ? 'border-primary bg-primary text-black' : isTop ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500' : 'border-white/10 bg-black/50 text-gray-500'}`}>
                                    {isPlaying ? <Play size={14} className="fill-current animate-pulse" /> : <span className="font-bebas text-xl leading-none">#{idx + 1}</span>}
                                </div>

                                <div className="flex-1 min-w-0 z-10">
                                    <div className={`text-sm font-mono truncate tracking-tight break-all ${isPlaying ? 'text-primary font-black drop-shadow-[0_0_8px_rgba(var(--color-primary),0.5)]' : 'text-gray-300 font-bold'}`}>
                                        {track.url.replace('https://', '').replace('www.', '')}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="font-mono text-[8.5px] text-gray-500 uppercase tracking-[0.2em]">
                                            INJECT: <span className="text-white">{track.submitterName || 'UNKNOWN'}</span>
                                        </span>
                                        {track.bumpTokenAmount > 0 && (
                                            <span className="font-mono text-[9px] flex items-center gap-1 text-yellow-400 font-black tracking-wider uppercase border border-yellow-500/30 px-2 py-[2px] bg-yellow-500/10 shadow-[0_0_10px_rgba(250,204,21,0.2)]">
                                                <Zap size={10} className="fill-yellow-400 animate-pulse" />
                                                {track.bumpTokenAmount} BOOSTS
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions Base */}
                                <div className="flex items-center gap-2 shrink-0 z-10">
                                    {/* Viewer Bump Mechanism (Stripe Connect) */}
                                    {!isHost && !isPlaying && (
                                        <button 
                                            onClick={() => bumpTrack(track)}
                                            disabled={isCheckingOut}
                                            className={`w-12 h-12 border rounded-none flex flex-col items-center justify-center transition-all group-hover/track:opacity-100 ${idx === 0 ? 'opacity-100' : 'opacity-0'}
                                                ${isCheckingOut ? 'border-gray-500 text-gray-500 bg-gray-500/10' : 'border-yellow-500/50 hover:bg-yellow-500 hover:text-black text-yellow-400 bg-yellow-500/10 hover:shadow-[0_0_20px_rgba(250,204,21,0.6)]'}`}
                                            title="Boost Track via Stripe (-1 Token)"
                                        >
                                            <DollarSign size={16} className={isCheckingOut ? 'animate-pulse' : 'group-hover/track:-translate-y-0.5 transition-transform'} />
                                            <span className="font-mono text-[7px] font-black uppercase mt-1">Boost</span>
                                        </button>
                                    )}

                                    {/* Host Executive Controls */}
                                    {isHost && (
                                        <>
                                            {track.status === 'pending' ? (
                                                <button onClick={() => playTrack(track)} className="w-10 h-10 bg-primary/10 hover:bg-primary border border-primary/30 hover:border-primary text-primary hover:text-black flex items-center justify-center transition-all group/btn shadow-[0_0_15px_rgba(var(--color-primary),0.1)]">
                                                    <Play size={14} className="fill-current group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                            ) : (
                                                <button onClick={() => finishTrack(track)} className="h-10 px-3 bg-[#0dff55]/10 hover:bg-[#0dff55] border border-[#0dff55]/30 hover:border-[#0dff55] text-[#0dff55] hover:text-black flex items-center justify-center transition-all font-mono text-[9px] font-black tracking-widest uppercase">
                                                    CLR
                                                </button>
                                            )}
                                            <button onClick={() => deleteTrack(track.id)} className="w-10 h-10 bg-red-500/10 hover:bg-red-500 font-black border border-red-500/30 text-red-500 hover:text-white flex items-center justify-center transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
            
            <div className="bg-black border-t border-primary/20 px-6 py-2 flex items-center justify-between relative z-20">
                 <span className="font-mono text-[7px] text-gray-500 uppercase tracking-[0.4em]">80/20 Escrow Royalty Handshake</span>
                 <span className="font-mono text-[8px] text-primary font-black uppercase tracking-widest cyber-flicker-slow">Stripe Secure</span>
            </div>
        </div>
    );
}
