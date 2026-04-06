'use client';
import { useState, useEffect, useCallback } from 'react';
import { Target, Zap, Shield, Activity, Play, Pause, ChevronRight, CheckCircle2, Clock, Music, ArrowUpRight, Lock, Radio, Database } from 'lucide-react';
import { useAudioStore } from '@/store/useAudioStore';
import { CyberButton } from '@/components/ui/CyberButton';
import { useUserStore } from '@/store/useUserStore';
import { doc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// MOCK DATA FOR MISSIONS - This will eventually come from the backend/Taxi sanitizer
const MOCK_MISSIONS = [
    {
        id: 'mission-001',
        title: 'NEON CHASE: CYBERPUNK SYNC',
        description: 'High-energy electronic tracks for a major AAA cyber-thriller game. Focus on aggressive synth leads and industrial percussion.',
        genre: 'Cyberpunk / Mid-Tempo',
        deadline: '24h 42m remaining',
        bpm: '105 - 110',
        reward: 'Level 4 Clearance + $500 Sync',
        refAudio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Placeholder
        status: 'active',
        difficulty: 'EASY'
    },
    {
        id: 'mission-002',
        title: 'ABYSSAL VOID: ATMOSPHERIC AMBIENT',
        description: 'Ethereal, dark ambient textures for an upcoming sci-fi anthology. No rhythm, focus on sonic depth and haunting pads.',
        genre: 'Dark Ambient / Drone',
        deadline: '3d 12h remaining',
        bpm: 'N/A',
        reward: 'Matrix King Points + $1.2k License',
        refAudio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', // Placeholder
        status: 'active',
        difficulty: 'MEDIUM'
    },
    {
        id: 'mission-003',
        title: 'VANGUARD: AGGRESSIVE PHONK',
        description: 'Tiktok-trending Phonk with cowbell focus and distorted 808s. Needed for the "Matrix Kings" 2026 Tournament teaser.',
        genre: 'Phonk / Drift',
        deadline: '12h 15m remaining',
        bpm: '128 - 135',
        reward: 'Legendary Badge + Shared Royalties',
        refAudio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', // Placeholder
        status: 'active',
        difficulty: 'HARD'
    }
];

function MissionCard({ mission, onJoin }: { mission: any, onJoin: (id: string) => void }) {
    const currentTrack = useAudioStore(state => state.currentTrack);
    const isPlaying = useAudioStore(state => state.isPlaying);
    const isThisPlaying = currentTrack?.id === mission.id && isPlaying;

    const playRef = () => {
        const state = useAudioStore.getState();
        if (isThisPlaying) {
            state.setIsPlaying(false);
        } else {
            state.setCurrentTrack({
                id: mission.id,
                title: `[MISSION REF] ${mission.title}`,
                src: mission.refAudio,
                producer: 'MISSION ARCHITECT'
            });
            state.setIsPlaying(true);
        }
    };

    return (
        <div className={`relative flex flex-col p-6 bg-black/60 backdrop-blur-xl border border-solid transition-all duration-500 overflow-hidden group ${isThisPlaying ? 'border-primary shadow-[0_0_30px_rgba(var(--color-primary),0.2)]' : 'border-primary/20 hover:border-primary/40'}`}
             style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}>
            
            {/* Background Texture */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(var(--color-primary),0.2),rgba(var(--color-primary),0.02),rgba(var(--color-primary),0.2))] bg-[length:100%_4px,4px_100%] group-hover:opacity-[0.08] transition-opacity" />
            
            <div className="relative z-10 flex flex-col h-full">
                {/* Header Metadata */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[8px] font-mono font-black italic tracking-widest px-2 py-0.5 border ${mission.difficulty === 'HARD' ? 'text-red-500 border-red-500/40 bg-red-500/5' : (mission.difficulty === 'MEDIUM' ? 'text-yellow-500 border-yellow-500/40 bg-yellow-500/5' : 'text-green-500 border-green-500/40 bg-green-500/5')}`}>
                                {mission.difficulty} INTEL
                            </span>
                            <span className="text-[8px] font-mono text-primary/60 tracking-widest uppercase">ID: {mission.id}</span>
                        </div>
                        <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-widest leading-none group-hover:text-primary transition-colors">
                            {mission.title}
                        </h3>
                    </div>
                    <div className="flex flex-col items-end text-right">
                        <div className="flex items-center gap-1.5 text-primary/80 mb-1">
                            <Clock size={12} className="animate-pulse" />
                            <span className="font-mono text-[9px] font-black uppercase tracking-widest">{mission.deadline}</span>
                        </div>
                        <span className="font-mono text-[8px] text-gray-500 tracking-widest uppercase">TIMELINE: RESTRICTED</span>
                    </div>
                </div>

                {/* Description Body */}
                <p className="font-mono text-[10px] text-gray-400 mb-6 leading-relaxed uppercase tracking-widest line-clamp-3">
                    {mission.description}
                </p>

                {/* Technical Readout */}
                <div className="grid grid-cols-2 gap-4 mb-6 border-y border-primary/20 py-4 bg-primary/5">
                    <div className="flex flex-col">
                        <span className="font-mono text-[7px] text-gray-500 uppercase tracking-widest mb-1">Acoustic Genre</span>
                        <div className="flex items-center gap-4">
                             <Music size={14} className="text-primary/60 shrink-0" />
                             <span className="font-mono text-[10px] text-white font-black truncate">{mission.genre}</span>
                        </div>
                    </div>
                    <div className="flex flex-col border-l border-primary/20 pl-4">
                        <span className="font-mono text-[7px] text-gray-500 uppercase tracking-widest mb-1">Target BPM</span>
                        <div className="flex items-center gap-4">
                             <Zap size={14} className="text-primary/60 shrink-0" />
                             <span className="font-mono text-[10px] text-white font-black">{mission.bpm}</span>
                        </div>
                    </div>
                </div>

                {/* Action Row */}
                <div className="mt-auto flex items-center justify-between gap-4">
                    <button 
                        onClick={playRef}
                        className={`flex items-center gap-3 px-4 py-2 border transition-all duration-300 font-mono text-[10px] font-black tracking-widest ${isThisPlaying ? 'bg-primary text-black border-primary' : 'bg-black/80 text-primary border-primary/40 hover:bg-primary/20'}`}
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}
                    >
                        {isThisPlaying ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current" />}
                        {isThisPlaying ? 'SCANNING REFERENCE' : 'ACOUSTIC TARGET'}
                    </button>

                    <CyberButton 
                        text="JOIN MISSION" 
                        className="h-10 px-6 text-[11px]" 
                        onClick={() => onJoin(mission.id)} 
                    />
                </div>

                {/* Financial Intel */}
                <div className="mt-4 flex items-center gap-3 border-t border-primary/10 pt-3">
                    <Shield size={12} className="text-primary/40" />
                    <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest">
                        REWARD: <span className="text-primary/80 font-black">{mission.reward}</span>
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function SpaceJamzForge() {
    const { currentUser } = useUserStore();
    const [missions, setMissions] = useState(MOCK_MISSIONS);
    const [isMounted, setIsMounted] = useState(false);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    const handleJoinMission = (id: string) => {
        alert(`MISSION PROTOCOL INITIATED: Transmitting data for Mission ${id}. Choose a track from your Vault to submit.`);
        // In a real app, this would open a modal with their Vault tracks
    };

    return (
        <div className="relative flex flex-1 w-full flex-col justify-start overflow-visible bg-transparent group/main shrink-0 min-h-max pt-0 pb-20">
            
            {/* CINEMATIC B-ROLL BACKGROUND LAYER */}
            <div className="fixed inset-0 z-[-1] flex items-center justify-center pointer-events-none overflow-hidden">
                <video 
                    src={`/api/neural-assets?node=SYNCSPACE&pilot=${currentUser?.uid || 'anon'}`}
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover opacity-20 mix-blend-screen scale-110 blur-[2px]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050505]/90 to-black z-10" />
            </div>

            {/* Massive Outer Cyber Panel -> RIG ARCHITECTURE */}
            <div className="flex-1 w-full flex flex-col justify-start z-50 px-4 md:px-14 pt-12">
                
                {/* HUD HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12 border-b-2 border-primary/20 pb-10">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 bg-primary animate-ping" />
                            <span className="font-mono text-[10px] text-primary tracking-[0.5em] uppercase font-black">Sync Engine Active</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter font-bebas text-white italic drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
                            SPACEJAMZ <span className="text-primary italic">SyncSpace</span>
                        </h1>
                        <div className="flex items-center gap-6 mt-1">
                            <p className="text-[10px] md:text-[12px] font-mono tracking-[0.4em] uppercase font-bold text-gray-500">
                                Global Placement Protocol <span className="text-primary/40">{'//'}</span> SYNC_FEED_V3.0
                            </p>
                            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20">
                                <Shield size={12} className="text-primary" />
                                <span className="font-mono text-[8px] text-primary tracking-widest font-black uppercase">CLEARANCE: FOUNDER</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end gap-2 pr-4 border-r border-primary/20">
                            <span className="font-mono text-[8px] text-gray-500 tracking-widest uppercase text-right">Global Activity</span>
                            <div className="flex gap-1">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className={`w-1 h-3 bg-primary transition-all duration-500 ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-20'}`} style={{ animationDelay: `${i * 100}ms` }} />
                                ))}
                            </div>
                        </div>
                        <CyberButton text="SCAN FOR INTEL" className="h-12 px-10" />
                    </div>
                </div>

                {/* FILTER BAR */}
                <div className="flex flex-wrap items-center gap-2 mb-10 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
                    {['ALL', 'CYBERPUNK', 'AMBIENT', 'PHONK', 'HIP HOP', 'CINEMATIC'].map((tag) => (
                        <button 
                            key={tag}
                            onClick={() => setFilter(tag)}
                            className={`px-6 py-2 font-mono text-[10px] font-black tracking-widest border transition-all duration-300 ${filter === tag ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(var(--color-primary),0.3)]' : 'bg-black/40 text-gray-500 border-white/10 hover:text-white hover:border-white/40'}`}
                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                {/* MISSION GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {missions.map((mission) => (
                        <MissionCard key={mission.id} mission={mission} onJoin={handleJoinMission} />
                    ))}
                    
                    {/* Locked Mission Placeholder */}
                    <div className="relative flex flex-col p-6 bg-black/40 backdrop-blur-md border border-dashed border-white/10 opacity-40 grayscale group cursor-not-allowed"
                         style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}>
                        <div className="flex-1 flex flex-col items-center justify-center py-10 gap-4">
                            <Lock size={32} className="text-gray-500 group-hover:shake" />
                            <span className="font-mono text-[10px] tracking-widest text-center uppercase font-black">Requires Level 5 Clarity</span>
                        </div>
                    </div>
                </div>

                {/* TERMINAL FOOTER */}
                <div className="mt-20 border-t border-primary/20 pt-10 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Target className="text-primary w-6 h-6 animate-pulse" />
                            <div className="flex flex-col">
                                <span className="font-mono text-[8px] text-primary/40 uppercase tracking-[0.4em]">Sub-System Analysis</span>
                                <span className="font-mono text-[11px] text-white tracking-widest uppercase font-black">Acoustic Signal Processing Node 01</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
                             <div className="w-1.5 h-1.5 bg-primary/40" />
                             <div className="w-1.5 h-1.5 bg-primary/20" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { label: 'UPLINK STATUS', value: 'OPTIMAL' },
                            { label: 'DATA LATENCY', value: '42ms' },
                            { label: 'NODES ACTIVE', value: '1,402' },
                            { label: 'ENCRYPTION', value: 'RSA-4096' }
                        ].map((stat) => (
                            <div key={stat.label} className="bg-primary/5 p-4 border-l border-primary/20">
                                <span className="font-mono text-[7px] text-gray-500 uppercase tracking-widest block mb-1">{stat.label}</span>
                                <span className="font-mono text-[12px] text-primary font-black tracking-widest">{stat.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* SCAN EFFECT OVERLAY */}
            <div className="fixed inset-0 pointer-events-none z-[100] opacity-5 mix-blend-screen bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%),linear-gradient(90deg,rgba(var(--color-primary),0.1),rgba(var(--color-primary),0.02),rgba(var(--color-primary),0.1))] bg-[length:100%_4px,4px_100%] animate-[cyber-glitch-container-anim_10s_infinite]" />
        </div>
    );
}
