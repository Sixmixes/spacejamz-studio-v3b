'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, TrendingUp, Sparkles, UploadCloud, Clock, Music, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { CyberButton } from '@/components/ui/CyberButton';
import { useAudioStore } from '@/store/useAudioStore';
import { useUserStore } from '@/store/useUserStore';
import { db } from '@/lib/firebase/config';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

interface ArenaTrack {
    id: string;
    title: string;
    artist: string;
    url: string;
    coverArt: string;
    cypherId?: string;
    createdAt?: any;
}

export default function SpaceJamzArena() {
    const { currentUser } = useUserStore();
    const { setCurrentTrack, setPlaylist, isPlaying, setIsPlaying, currentTrack } = useAudioStore();
    
    const [tracks, setTracks] = useState<ArenaTrack[]>([]);
    const [activeTab, setActiveTab] = useState<'trending' | 'new' | 'cypher'>('cypher');
    const [isUploading, setIsUploading] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const q = query(collection(db, 'arena_tracks'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ArenaTrack));
            setTracks(fetched);
            if (fetched.length > 0) {
                setPlaylist(fetched.map(t => ({
                    id: t.id,
                    title: t.title,
                    artist: t.artist,
                    coverUrl: t.coverArt,
                    streamUrl: t.url,
                    audioSrc: t.url
                } as any)));
            }
        });
        return () => unsub();
    }, [setPlaylist]);

    const handleBeatUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentUser) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('fileName', `arena/${currentUser.uid}/${Date.now()}_${file.name}`);
            formData.append('mimeType', file.type || 'audio/wav');

            const res = await fetch('/api/storage/drive', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Drive API transmission failed.');
            const data = await res.json();

            await addDoc(collection(db, 'arena_tracks'), {
                title: file.name.replace(/\.[^/.]+$/, ""),
                artist: currentUser.displayName || 'Unknown Architect',
                artistId: currentUser.uid,
                url: data.url,
                coverArt: currentUser.photoURL || 'https://images.unsplash.com/photo-1614113489855-66422ad300a4?auto=format&fit=crop&q=80',
                cypherId: activeTab === 'cypher' ? 'week-04-flip' : 'freestyle',
                createdAt: serverTimestamp(),
            });

            await addDoc(collection(db, 'user_assets', currentUser.uid, 'tracks'), {
                title: file.name.replace(/\.[^/.]+$/, ""),
                url: data.url,
                artistId: currentUser.uid,
                type: 'human_beat',
                createdAt: serverTimestamp(),
            });

        } catch (err) {
            console.error('Upload sequence aborted:', err);
            alert("MATRIX DISCONNECTED: Failed to upload human asset.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const playArenaTrack = (track: ArenaTrack) => {
        if (currentTrack?.id === track.id) {
            setIsPlaying(!isPlaying);
        } else {
            setCurrentTrack({
                id: track.id,
                title: track.title,
                artist: track.artist,
                coverUrl: track.coverArt,
                streamUrl: track.url,
                audioSrc: track.url
            } as any);
            setIsPlaying(true);
        }
    };

    return (
        <div className="relative flex flex-1 w-full flex-col justify-start overflow-visible bg-transparent group/main shrink-0 min-h-max pt-12 md:pt-20 pb-20 text-white selection:bg-[#00ffff]/20">
            
            {/* CINEMATIC B-ROLL BACKGROUND LAYER */}
            <div className="fixed inset-0 z-[-1] flex items-center justify-center pointer-events-none overflow-hidden">
                <video 
                    src={`/api/neural-assets?node=ARENA&pilot=cypher`}
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover opacity-15 mix-blend-screen scale-110 blur-[2px]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050505]/80 to-black z-10" />
            </div>

            <div className="cyber-panel p-6 md:p-14 w-full flex-1 max-w-[1700px] mx-auto relative z-50 overflow-hidden bg-black/80 border-2 border-[#00ffff]/20 shadow-[0_40px_100px_rgba(0,0,0,1)] rounded-t-[40px] md:rounded-[40px]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 50px), calc(100% - 50px) 100%, 0 100%)' }}>
                
                {/* Tactical HUD Overlay for Arena */}
                <div className="absolute top-6 left-8 flex flex-col gap-1 opacity-20">
                    <span className="font-mono text-[7px] text-[#00ffff] tracking-[0.5em] font-black uppercase italic">Arena_Node: AUTHORIZED</span>
                    <div className="w-16 h-0.5 bg-[#00ffff]/40" />
                </div>

                <div className="flex flex-col gap-8 md:gap-12 mt-8 md:mt-4">
                    {/* FEATURED CYPHER DECK */}
                    <div className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden bg-zinc-900 border border-[#00ffff]/30 shadow-[0_0_60px_rgba(0,255,255,0.1)] group">
                        <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[12s] ease-out" alt="Cypher Background" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(0,255,255,0.1),transparent_70%)]" />

                        <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-end">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="inline-flex items-center gap-2 bg-[#00ffff]/20 border border-[#00ffff]/40 px-4 py-2 rounded-full backdrop-blur-md">
                                    <Clock className="w-4 h-4 text-[#00ffff] animate-pulse" />
                                    <span className="text-[10px] md:text-xs font-mono text-[#00ffff] font-black tracking-widest uppercase">72:04:15 LIVE</span>
                                </div>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-[#00ffff]/30 to-transparent hidden md:block" />
                            </div>

                            <div className="max-w-4xl">
                                <h1 className="text-5xl md:text-8xl font-bebas tracking-tighter text-white mb-4 drop-shadow-[0_4px_20px_rgba(0,255,255,0.3)] leading-[0.85]">
                                    CYPHER 04:<br/><span className="text-[#00ffff]">THE SYNTH FLIP</span>
                                </h1>
                                <p className="text-sm md:text-lg text-gray-300 font-mono tracking-tight leading-relaxed mb-10 max-w-2xl opacity-90">
                                    Unauthorized access to raw [ DX7 ] analog stems is active. Sequester the DNA, synthesize your perspective, and archive your flip before the link de-syncs.
                                </p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                <CyberButton text="DOWNLOAD DNA STEMS" kbd="RAW" onClick={() => alert("STREAMING DNA TO LOCAL CACHE...")} className="h-16 md:h-20 text-xl font-black" />
                                
                                <input type="file" ref={fileInputRef} onChange={handleBeatUpload} accept="audio/*" className="hidden" />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="h-16 md:h-20 flex items-center justify-center gap-4 bg-white/5 hover:bg-white text-white hover:text-black border border-white/20 px-8 rounded-xl font-mono text-xs md:text-sm font-black tracking-[0.2em] uppercase transition-all duration-500 shadow-2xl active:scale-95"
                                >
                                    {isUploading ? <><Loader2 className="w-5 h-5 animate-spin" /> UPLOADING...</> : <><UploadCloud className="w-6 h-6" /> UPLOAD YOUR FLIP</>}
                                </button>
                            </div>
                        </div>

                        {/* Top corner diagnostic */}
                        <div className="absolute top-8 right-8 flex flex-col items-end opacity-40">
                            <span className="text-[9px] font-mono text-[#00ffff] tracking-widest font-black uppercase">SEC_LEVEL_04</span>
                            <div className="flex gap-1 mt-1">
                                {[1,2,3,4,5].map(i => <div key={i} className={`w-1 h-3 ${i <= 4 ? 'bg-[#00ffff]' : 'bg-white/10'}`} />)}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
                            <div className="flex items-center gap-8 md:gap-12">
                                {(['cypher', 'trending', 'new'] as const).map((tab) => (
                                    <button 
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`group relative text-2xl md:text-3xl font-bebas tracking-widest uppercase transition-all flex items-center gap-3 ${activeTab === tab ? 'text-[#00ffff]' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        <div className={`p-2 rounded-lg border transition-all ${activeTab === tab ? 'bg-[#00ffff]/10 border-[#00ffff]/40 scale-110' : 'bg-white/5 border-transparent group-hover:border-white/20'}`}>
                                            {tab === 'cypher' && <Sparkles size={20} />}
                                            {tab === 'trending' && <TrendingUp size={20} />}
                                            {tab === 'new' && <Music size={20} />}
                                        </div>
                                        {tab}
                                        {activeTab === tab && (
                                            <motion.div layoutId="arenaTab" className="absolute -bottom-[25px] left-0 right-0 h-1 bg-[#00ffff] shadow-[0_0_15px_rgba(0,255,255,0.8)]" />
                                        )}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="flex items-center gap-3 bg-black/40 border border-white/10 px-4 py-2 rounded-full hidden lg:flex">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                                <span className="font-mono text-[9px] text-[#00ffff] font-black uppercase tracking-widest">Global_Sync: OK</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                            {tracks.length === 0 ? (
                                <div className="col-span-full py-24 flex flex-col items-center justify-center bg-black/40 border border-dashed border-white/10 rounded-3xl opacity-50">
                                    <div className="relative mb-6">
                                        <div className="absolute -inset-4 bg-[#00ffff]/10 blur-xl rounded-full" />
                                        <Music className="w-12 h-12 text-white relative z-10" />
                                    </div>
                                    <span className="font-mono tracking-[0.4em] uppercase text-[10px] font-black text-white/40">NO NEURAL ASSETS DETECTED IN THIS SECTOR</span>
                                </div>
                            ) : (
                                tracks.map((track, idx) => {
                                    const isThisPlaying = currentTrack?.id === track.id && isPlaying;
                                    return (
                                        <div key={track.id} 
                                            className="group bg-black/40 backdrop-blur-md border border-white/10 hover:border-[#00ffff]/40 rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,1),0_0_30px_rgba(0,255,255,0.1)] relative"
                                            style={{ animationDelay: `${idx * 50}ms` }}
                                        >
                                            <div className="relative aspect-square overflow-hidden cursor-pointer" onClick={() => playArenaTrack(track)}>
                                                <img src={track.coverArt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s] grayscale-[0.3] group-hover:grayscale-0" alt="Cover" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
                                                
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className={`w-20 h-20 rounded-full bg-black/80 backdrop-blur-xl border-2 transition-all duration-500 flex items-center justify-center shadow-2xl ${isThisPlaying ? 'border-[#00ffff] scale-110' : 'border-white/20 scale-0 group-hover:scale-100'}`}>
                                                        {isThisPlaying ? <Pause size={32} className="text-[#00ffff] fill-current" /> : <Play size={32} className="text-white fill-current ml-1" />}
                                                    </div>
                                                </div>

                                                {/* Rank/Badge Overlay */}
                                                <div className="absolute top-4 left-4 p-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all font-mono text-[9px] text-white/60 tracking-widest font-black">
                                                    [ ARCHIVE_{idx + 1} ]
                                                </div>
                                            </div>
                                            
                                            <div className="p-6 relative">
                                                <div className="flex flex-col gap-1">
                                                    <h3 className="text-2xl font-bebas font-black text-white tracking-widest truncate group-hover:text-[#00ffff] transition-colors uppercase leading-none">{track.title}</h3>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <div className="w-5 h-5 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
                                                            <img src={track.coverArt} className="w-full h-full object-cover" alt="Artist" />
                                                        </div>
                                                        <p className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest truncate">Prod. {track.artist}</p>
                                                    </div>
                                                </div>
                                                
                                                {/* Audio reactive floor decoration */}
                                                <div className="flex gap-[2px] mt-6 opacity-20 group-hover:opacity-60 transition-opacity">
                                                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                                                        <div key={i} className={`flex-1 h-1 bg-[#00ffff] ${isThisPlaying ? 'animate-bounce' : ''}`} style={{ animationDelay: `${i * 100}ms` }} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
