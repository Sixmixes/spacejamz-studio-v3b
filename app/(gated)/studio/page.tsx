'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, TrendingUp, Sparkles, UploadCloud, Clock, Music } from 'lucide-react';
import { CyberButton } from '@/components/ui/CyberButton';
import NeuralIdentityTerminal from '@/components/global/NeuralIdentityTerminal';
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
        <div className="flex flex-col items-center justify-start min-h-screen pb-32 relative overflow-hidden bg-transparent text-white px-4 md:px-8 pt-[120px]">
            
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

            <div className="w-full max-w-7xl z-[60] mb-8">
                <NeuralIdentityTerminal />
            </div>

            <div className="w-full max-w-7xl z-50 flex flex-col gap-6">
                
                <div className="relative w-full h-80 rounded-3xl overflow-hidden bg-zinc-900 border border-[#00ffff]/20 shadow-[0_0_50px_rgba(0,255,255,0.05)] group">
                    <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-[10s]" alt="Cypher Background" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
                    
                    <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
                        <div className="inline-flex items-center gap-2 bg-[#00ffff]/10 border border-[#00ffff]/30 px-3 py-1 rounded-full mb-4 w-max">
                            <Clock className="w-4 h-4 text-[#00ffff] animate-pulse" />
                            <span className="text-xs font-mono text-[#00ffff] tracking-widest uppercase">72:04:15 REMAINING</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bebas tracking-widest text-white mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                            CYPHER 04: THE SYNTH FLIP
                        </h1>
                        <p className="text-sm md:text-base text-gray-300 max-w-2xl leading-relaxed mb-6 font-mono">
                            The Architect has authorized access to the raw DX7 analog stems. Download the source DNA, run it through your organic hardware, and upload your final drop back into the Arena before the neural link severs.
                        </p>
                        
                        <div className="flex items-center gap-4">
                            <CyberButton text="DOWNLOAD STEM DNA" kbd="WAV" onClick={() => alert("DOWNLOADING STEM...")} />
                            
                            <input type="file" ref={fileInputRef} onChange={handleBeatUpload} accept="audio/*" className="hidden" />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/20 px-6 py-4 rounded-xl font-mono text-sm tracking-widest uppercase transition-all"
                            >
                                <UploadCloud className="w-5 h-5 flex-shrink-0" />
                                {isUploading ? 'TRANSMITTING TO 30TB...' : 'UPLOAD BATTLE FLIP'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="w-full flex flex-col gap-6 mt-4">
                    <div className="flex items-center gap-6 border-b border-white/10 pb-4">
                        {(['cypher', 'trending', 'new'] as const).map((tab) => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`text-xl font-bebas tracking-widest uppercase transition-colors flex items-center gap-2 ${activeTab === tab ? 'text-[#00ffff] drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]' : 'text-gray-500 hover:text-white'}`}
                            >
                                {tab === 'cypher' && <Sparkles className="w-5 h-5" />}
                                {tab === 'trending' && <TrendingUp className="w-5 h-5" />}
                                {tab === 'new' && <Music className="w-5 h-5" />}
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {tracks.length === 0 ? (
                            <div className="col-span-full py-12 flex flex-col items-center justify-center opacity-40">
                                <Music className="w-12 h-12 mb-4" />
                                <span className="font-mono tracking-widest uppercase text-sm">NO ORGANIC ASSETS DETECTED IN THIS SECTOR</span>
                            </div>
                        ) : (
                            tracks.map((track) => {
                                const isThisPlaying = currentTrack?.id === track.id && isPlaying;
                                return (
                                    <div key={track.id} className="group bg-black/40 border border-[#00ffff]/10 hover:border-[#00ffff]/30 rounded-2xl overflow-hidden transition-all duration-300">
                                        <div className="relative aspect-square overflow-hidden cursor-pointer" onClick={() => playArenaTrack(track)}>
                                            <img src={track.coverArt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Cover" />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                                <button className={`w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-[#00ffff]/40 flex items-center justify-center text-[#00ffff] transition-all transform ${isThisPlaying ? 'scale-110 shadow-[0_0_30px_rgba(0,255,255,0.3)]' : 'scale-90 group-hover:scale-100'}`}>
                                                    {isThisPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-lg font-bold font-mono text-white truncate group-hover:text-[#00ffff] transition-colors">{track.title}</h3>
                                            <p className="text-xs font-mono text-gray-400 capitalize truncate mt-1">Prod. {track.artist}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
