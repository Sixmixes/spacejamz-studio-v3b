'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { doc, setDoc, onSnapshot, getDocs, collection, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { Radio, AlertTriangle, Users, Play, Square, Loader2, Trophy, RefreshCw, Zap, Shield, Activity, Clock, Cpu, ShieldAlert } from 'lucide-react';
import { CyberButton } from '@/components/ui/CyberButton';
import { ArchitectReceptacle } from './ArchitectReceptacle';

const GENRES = ['90s Boom Bap', 'Industrial Techno', 'Cyber-Phonk', '80s Synthwave', 'Drill', 'Ambient'];

const ArchitectArena = () => {
    const [activeGenre, setActiveGenre] = useState(GENRES[0]);
    const [battleState, setBattleState] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [showSimModal, setShowSimModal] = useState(false);

    // BATTLE SNAPSHOT
    useEffect(() => {
        const battleRef = doc(db, 'battles', activeGenre);
        const unsubscribe = onSnapshot(battleRef, (snap) => {
            if (snap.exists()) {
                setBattleState({ id: snap.id, ...snap.data() });
            } else {
                setBattleState({
                    id: activeGenre,
                    status: 'WAITING',
                    contestants: [],
                    voters: [],
                    endTime: null
                });
            }
        });
        return () => unsubscribe();
    }, [activeGenre]);

    // TIMER LOGIC (v2 Port)
    useEffect(() => {
        if (battleState?.status === 'ACTIVE' && battleState.endTime) {
            const interval = setInterval(() => {
                const now = new Date().getTime();
                const distance = battleState.endTime - now;

                if (distance < 0) {
                    clearInterval(interval);
                    setTimeLeft("00:00:00");
                } else {
                    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const s = Math.floor((distance % (1000 * 60)) / 1000);
                    setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [battleState]);

    const handlePurge = async () => {
        if (!confirm("ARCHITECT: Force purge this battle lobby?")) return;
        setIsUpdating(true);
        const battleRef = doc(db, 'battles', activeGenre);
        try {
            await setDoc(battleRef, {
                status: 'WAITING',
                endTime: null,
                contestants: [],
                voters: []
            });
        } catch (e) {
            console.error(e);
        }
        setIsUpdating(false);
    };

    const handleVote = async (contestantId: string) => {
        if (battleState.status !== 'ACTIVE') return;
        setIsUpdating(true);
        const battleRef = doc(db, 'battles', activeGenre);
        try {
            const updatedContestants = battleState.contestants.map((c: any) => {
                if (c.id === contestantId) {
                    return { ...c, votes: (c.votes || 0) + 1 };
                }
                return c;
            });
            await updateDoc(battleRef, { contestants: updatedContestants });
        } catch (e) {
            console.error(e);
        }
        setIsUpdating(false);
    };

    const simulateSwarm = async () => {
        setShowSimModal(false);
        setIsUpdating(true);
        const battleRef = doc(db, 'battles', activeGenre);
        try {
            for (let i = 0; i < 25; i++) {
                const choice = Math.random() > 0.4 ? 0 : 1;
                const snap = await getDoc(battleRef);
                if (snap.exists()) {
                    const current = snap.data().contestants;
                    if (current[choice]) {
                        current[choice].votes = (current[choice].votes || 0) + 1;
                        await updateDoc(battleRef, { contestants: current });
                    }
                }
                await new Promise(r => setTimeout(r, 200));
            }
        } catch (e) { console.error(e); }
        setIsUpdating(false);
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-700">
            {/* HUD HEADER */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="inline-flex items-center gap-2 text-white bg-primary text-[10px] font-mono tracking-[0.4em] uppercase mb-4 px-4 py-1.5 border border-primary/50 w-max cyber-card shadow-[0_0_15px_rgb(var(--color-primary)/0.4)]">
                        <Trophy className="w-3 h-3" />
                        GLOBAL DOMINATION ENGINE
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bebas tracking-widest uppercase leading-none text-transparent bg-clip-text bg-gradient-to-br from-white via-primary to-primary/50 drop-shadow-[0_0_20px_rgb(var(--color-primary)/0.6)]">
                        {activeGenre} Division
                    </h2>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                    <div className={`px-4 py-1 rounded border font-mono text-[10px] uppercase tracking-widest flex items-center gap-3 ${battleState?.status === 'ACTIVE' ? 'border-primary text-primary bg-primary/10 animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'border-orange-500/30 text-orange-400 bg-orange-500/5'}`}>
                        <div className={`w-2 h-2 rounded-full ${battleState?.status === 'ACTIVE' ? 'bg-primary' : 'bg-orange-400'}`} />
                        STATUS: {battleState?.status}
                    </div>
                    {battleState?.status === 'ACTIVE' && (
                        <div className="text-2xl font-bebas text-white tracking-[0.2em] flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary animate-spin-slow" />
                            {timeLeft}
                        </div>
                    )}
                </div>
            </div>

            {/* GENRE SELECTOR RECEPTACLE */}
            <div className="flex overflow-x-auto gap-3 pb-6 hide-scrollbar shrink-0">
                {GENRES.map(genre => (
                    <button 
                        key={genre}
                        onClick={() => setActiveGenre(genre)}
                        className={`whitespace-nowrap px-6 py-2.5 rounded-lg border text-[10px] font-mono uppercase tracking-[0.2em] transition-all ${activeGenre === genre ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-black/60 border-white/5 text-gray-500 hover:text-white hover:border-white/20'}`}
                    >
                        {genre}
                    </button>
                ))}
            </div>

            {/* BATTLE GRID */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1 overflow-y-auto pr-2 custom-scrollbar pb-6">
                {[0, 1].map(idx => {
                    const contestant = battleState?.contestants?.[idx];
                    return (
                        <ArchitectReceptacle 
                            key={idx}
                            icon={contestant ? Shield : ShieldAlert}
                            title={contestant ? contestant.name : `SLOT_${idx + 1}_EMPTY`}
                            subtitle={contestant ? `INITIATE_RANK // VOTES: ${contestant.votes}` : "AWAITING_CHALLENGER"}
                            borderColor={contestant ? 'border-primary/30' : 'border-white/5'}
                            glowColor={contestant ? 'rgb(var(--color-primary) / 0.05)' : 'transparent'}
                            className={`${!contestant && 'opacity-40 grayscale'}`}
                        >
                            {contestant ? (
                                <div className="space-y-6">
                                    <div className="aspect-video bg-black/60 rounded-xl border border-white/5 flex items-center justify-center group cursor-pointer hover:border-primary/40 transition-all overflow-hidden relative">
                                        <Play className="w-12 h-12 text-gray-700 group-hover:text-primary transition-colors relative z-10" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-primary/40" />
                                            <span className="text-[10px] font-mono text-gray-400">SYNCED_VOTERS: {contestant.votes}</span>
                                        </div>
                                        <CyberButton 
                                            text="CAST VOTE"
                                            disabled={battleState.status !== 'ACTIVE' || isUpdating}
                                            onClick={() => handleVote(contestant.id)}
                                            className="h-10 px-8"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="h-48 flex flex-col items-center justify-center text-center">
                                    <Cpu className="w-12 h-12 text-gray-800 mb-4 animate-pulse" />
                                    <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest max-w-[200px]">
                                        NEURAL_LINK_VACANT // INITIATE_DEPLOYMENT_REQUIRED
                                    </p>
                                </div>
                            )}
                        </ArchitectReceptacle>
                    );
                })}
            </div>

            {/* ACTION FOOTER */}
            <div className="flex items-center gap-4 pt-6 border-t border-primary/20 z-10 w-full mb-4">
                <CyberButton 
                    text="PURGE LOBBY"
                    variant="danger"
                    onClick={handlePurge}
                    className="flex-1 h-12"
                />
                
                {battleState?.status === 'ACTIVE' && (
                    <button 
                        disabled={isUpdating}
                        onClick={() => setShowSimModal(true)}
                        className="flex-1 h-12 bg-purple-600/20 border border-purple-500/40 text-purple-400 font-bebas text-xl tracking-widest hover:bg-purple-600 hover:text-white transition-all rounded-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                    >
                        <Users className="w-5 h-5" /> EXECUTE SWARM
                    </button>
                )}
            </div>

            {/* MODAL PORT */}
            {showSimModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setShowSimModal(false)} />
                    <div className="relative z-10 w-full max-w-lg cyber-panel border border-purple-500/50 p-10 shadow-[0_0_100px_rgba(168,85,247,0.4)] animate-in zoom-in-95 bg-black">
                        <div className="flex items-center gap-4 mb-6 border-b border-purple-500/30 pb-4">
                            <Users className="w-10 h-10 text-purple-500" />
                            <h2 className="text-purple-500 font-bebas text-4xl tracking-widest uppercase">Target Swarm Injection</h2>
                        </div>
                        <p className="font-mono text-purple-500/60 text-xs mb-8 leading-relaxed tracking-wider">
                            CONFIRM: Push 25 synthetic neural votes to the [{activeGenre}] arena? This action will attempt to simulate organic traffic load and calibrate the domination tally.
                        </p>
                        <div className="flex gap-4">
                            <button onClick={simulateSwarm} className="flex-1 bg-purple-600 h-14 text-white font-bebas text-2xl tracking-widest hover:bg-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.6)]">EXECUTE</button>
                            <button onClick={() => setShowSimModal(false)} className="flex-1 bg-white/5 h-14 text-white font-bebas text-2xl tracking-widest hover:bg-white/10">ABORT</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArchitectArena;
