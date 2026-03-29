'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { db, storage } from '@/lib/firebase/config';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { User, Zap, Coins, Image as ImageIcon, Video, Trash2, CheckCircle2, Layout, Award, Music, FileText, Microchip, ShoppingBag, Play, Pause } from 'lucide-react';
import { useAudioStore } from '@/store/useAudioStore';
import { CyberButton } from '@/components/ui/CyberButton';
import NeuralIdentityTerminal from '@/components/global/NeuralIdentityTerminal';

export default function PrivateMatrix() {
    const { currentUser, isArchitect } = useUserStore();
    const { setCurrentTrack, setPlaylist, isPlaying, setIsPlaying, currentTrack } = useAudioStore();
    const [generations, setGenerations] = useState<any[]>([]);
    const [tracks, setTracks] = useState<any[]>([]);
    const [lyrics, setLyrics] = useState<any[]>([]);
    const [dna, setDna] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'neural' | 'acoustic' | 'script' | 'dna' | 'arsenal'>('neural');
    const [activeBanner, setActiveBanner] = useState<string | null>(null);

    useEffect(() => {
        if (!currentUser) return;

        // Fetch user's neural archives from the 30TB Cloud
        const q = query(
            collection(db, 'user_assets', currentUser.uid, 'ai_generations'),
            orderBy('createdAt', 'desc')
        );
        const unsubNeural = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setGenerations(items);
            setIsLoading(false);
        });

        // 2. Fetch User Acoustic Vault (Tracks)
        const tracksQuery = query(collection(db, 'user_assets', currentUser.uid, 'tracks'), orderBy('createdAt', 'desc'));
        const unsubTracks = onSnapshot(tracksQuery, snap => setTracks(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

        // 3. Fetch Neural Scripts (Lyrics)
        const lyricsQuery = query(collection(db, 'user_assets', currentUser.uid, 'lyrics'), orderBy('createdAt', 'desc'));
        const unsubLyrics = onSnapshot(lyricsQuery, snap => setLyrics(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

        // 4. Fetch DNA Sequencer Data (Vocal DNA)
        const dnaQuery = query(collection(db, 'user_assets', currentUser.uid, 'vocal_dna'), orderBy('createdAt', 'desc'));
        const unsubDna = onSnapshot(dnaQuery, snap => setDna(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

        return () => {
            unsubNeural();
            unsubTracks();
            unsubLyrics();
            unsubDna();
        };
    }, [currentUser]);

    const equipBanner = async (url: string) => {
        if (!currentUser) return;
        try {
            // Update the user's aesthetic profile in Firestore
            await updateDoc(doc(db, 'users', currentUser.uid), {
                customBannerUrl: url
            });
            // Update local state is handled via the store/observer usually
            alert("NEURAL BANNER SYNCHRONIZED.");
        } catch (err) {
            console.error(err);
        }
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <span className="font-mono text-primary animate-pulse">ESTABLISHING NEURAL LINK...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden pb-32">
            
            <div className="absolute top-8 left-0 right-0 z-[100] pointer-events-none px-4 md:px-8">
                <NeuralIdentityTerminal className="pointer-events-auto shadow-[0_30px_60px_rgba(0,0,0,0.8)]" />
            </div>

            {/* MASSIVE PILOT BANNER (Dynamic GPU Art) */}
            <div className="relative w-full h-[40vh] bg-zinc-900 overflow-hidden border-b border-white/10 group">
                {currentUser.customBannerUrl ? (
                    <img src={currentUser.customBannerUrl} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[10s] ease-linear" />
                ) : (
                    <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(var(--color-primary),0.1)_0,transparent_100%)] flex items-center justify-center">
                        <span className="font-mono text-[10px] text-gray-700 uppercase tracking-[1em]">No Aesthetic Data Detected</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                
                {/* Profile Stats Floating Container */}
                <div className="absolute bottom-12 left-8 md:left-20 flex items-end gap-10 animate-in slide-in-from-bottom-8 duration-700">
                    <div className="relative group">
                        <div className="w-32 h-32 md:w-48 md:h-48 bg-black border-2 border-primary p-1 overflow-hidden shadow-[0_0_50px_rgba(var(--color-primary),0.2)]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)' }}>
                            <img src={currentUser.photoURL || 'https://api.dicebear.com/7.x/identicon/svg?seed=pilot'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="absolute -bottom-4 -right-4 bg-primary text-black px-4 py-1 font-black font-bebas text-xl md:text-3xl tracking-widest shadow-xl">
                            LVL {Math.floor((currentUser.xp || 0) / 1000) + 1}
                        </div>
                    </div>
                    
                    <div className="flex flex-col mb-4">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl md:text-7xl font-black font-bebas tracking-widest uppercase drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
                                {currentUser.displayName || 'UNKNOWN PILOT'}
                            </h1>
                            {currentUser.role === 'FOUNDER' && <Award className="text-yellow-500 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" size={32} />}
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 font-mono text-xs text-primary bg-primary/10 px-3 py-1 border border-primary/20 tracking-widest uppercase">
                                <Zap size={14} /> {currentUser.xp?.toLocaleString() || '0'} Matrix XP
                            </div>
                            <div className="flex items-center gap-2 font-mono text-xs text-yellow-500 bg-yellow-500/10 px-3 py-1 border border-yellow-500/20 tracking-widest uppercase">
                                <Coins size={14} /> {currentUser.coinsBalance?.toLocaleString() || '0'} Treasury
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TACTICAL NAVIGATION (POD CATEGORIES) */}
            <div className="w-full max-w-[1800px] mx-auto px-4 md:px-8 mt-12 grid grid-cols-2 sm:grid-cols-5 gap-3 md:gap-6 z-20">
                {(['neural', 'acoustic', 'script', 'dna', 'arsenal'] as const).map(tab => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        className={`flex flex-col items-center justify-center p-4 md:p-8 transition-all duration-300 border-2 relative overflow-hidden group shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${activeTab === tab ? 'bg-primary text-black border-white shadow-[0_0_30px_rgba(var(--color-primary),0.3)]' : 'bg-black/90 text-primary/40 border-primary/10 hover:border-primary/40'}`}
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)' }}
                    >
                        {tab === 'neural' && <ImageIcon size={24} className="mb-2" />}
                        {tab === 'acoustic' && <Music size={24} className="mb-2" />}
                        {tab === 'script' && <FileText size={24} className="mb-2" />}
                        {tab === 'dna' && <Microchip size={24} className="mb-2" />}
                        {tab === 'arsenal' && <ShoppingBag size={24} className="mb-2" />}
                        <span className="font-mono text-[9px] md:text-[10px] items-center text-center font-black uppercase tracking-[0.2em]">
                            {tab === 'neural' ? 'Neural Archives' : 
                             tab === 'acoustic' ? 'Acoustic Vault' : 
                             tab === 'script' ? 'Neural Script' : 
                             tab === 'dna' ? 'DNA Sequencer' : 'Cosmetic Arsenal'}
                        </span>
                        {/* Status Light */}
                        <div className={`absolute top-2 right-2 w-1 h-1 rounded-full ${activeTab === tab ? 'bg-black animate-pulse' : 'bg-primary/20'}`} />
                    </button>
                ))}
            </div>

            {/* NEURAL ARCHIVE DECK (AI Generations) */}
            <div className="w-full max-w-[1800px] mx-auto px-4 md:px-8 pt-12 md:pt-20">
                {activeTab === 'neural' && (
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex items-center justify-between mb-8 md:mb-12 border-b-2 border-primary/20 pb-8">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-primary/10 border border-primary/30 rounded-full shadow-[0_0_20px_rgba(var(--color-primary),0.2)]">
                                    <Layout className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-3xl md:text-5xl font-black font-bebas tracking-widest uppercase text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">Neural Archives</h2>
                                    <p className="font-mono text-[9px] sm:text-[11px] text-primary/60 uppercase tracking-[0.5em] font-bold italic">GPU-Accelerated Visual Identity Payloads</p>
                                </div>
                            </div>
                            <div className="hidden sm:flex gap-4">
                                <CyberButton text="AI FOUNDRY" onClick={() => (window.location.href = '/ai')} className="h-14 px-8" />
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="h-64 flex flex-col items-center justify-center gap-4">
                                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <span className="font-mono text-primary/40 tracking-[1em] uppercase text-[10px]">Syncing 30TB Neural Cloud...</span>
                            </div>
                        ) : generations.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-primary/20 bg-primary/5 p-12 text-center opacity-60">
                                <ImageIcon size={48} className="text-primary/20 mb-4" />
                                <h3 className="text-2xl font-bebas tracking-widest uppercase">No Visual Payload</h3>
                                <p className="font-mono text-[10px] uppercase tracking-widest mt-2">Initialize the AI Foundry to archive assets.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                                {generations.map((gen, i) => (
                                    <div key={gen.id} className="group relative bg-black/95 border-2 border-primary/10 transition-all duration-500 hover:border-primary/60 shadow-[0_10px_30px_rgba(0,0,0,0.5)] p-0.5" style={{ animationDelay: `${i * 50}ms`, clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}>
                                        <div className="aspect-square relative overflow-hidden bg-zinc-900/50">
                                            {gen.type === 'deforum' ? (
                                                <video src={gen.assetUrl} className="w-full h-full object-cover opacity-70 group-hover:opacity-100" muted loop onMouseEnter={(e) => (e.target as HTMLVideoElement).play()} onMouseLeave={(e) => (e.target as HTMLVideoElement).pause()} />
                                            ) : (gen.type === 'vocal_dna' || gen.type === 'neural_swap') ? (
                                                <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#050505] animate-in fade-in transition-all group-hover:bg-primary/5">
                                                    <div className="mb-4 p-4 bg-primary/10 rounded-full group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(var(--color-primary),0.2)]">
                                                        <Zap className="text-primary w-12 h-12" />
                                                    </div>
                                                    <span className="text-[10px] font-mono text-primary/80 uppercase tracking-widest font-black text-center mb-1">ACOUSTIC PAYLOAD</span>
                                                    <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest text-center">{gen.type.replace('_',' ')}</span>
                                                </div>
                                            ) : (
                                                <img src={gen.assetUrl} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" />
                                            )}
                                            <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6 gap-4 backdrop-blur-sm">
                                                {gen.type === 'vocal_dna' || gen.type === 'neural_swap' ? (
                                                    <audio src={gen.assetUrl} controls className="w-full accent-primary h-8 mb-2" />
                                                ) : (
                                                    <button onClick={() => equipBanner(gen.assetUrl)} className="w-full py-2 bg-primary text-black font-mono font-black text-[9px] uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_15px_rgba(var(--color-primary),0.3)]">EQUIP BANNER</button>
                                                )}
                                                <button className="w-full py-2 bg-black border border-white/10 text-white font-mono font-bold text-[8px] uppercase tracking-widest hover:border-red-500 transition-all">EXPUNGE</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'acoustic' && (
                    <div className="animate-in slide-in-from-right-8 duration-500">
                        <div className="flex items-center justify-between mb-12 border-b-2 border-primary/20 pb-8">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-primary/10 border border-primary/30 rounded-full">
                                    <Music className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-3xl md:text-5xl font-black font-bebas tracking-widest uppercase text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">Acoustic Vault</h2>
                                    <p className="font-mono text-[10px] md:text-[11px] text-primary/60 uppercase tracking-[0.5em] font-bold">Authenticated Audio Ingestions</p>
                                </div>
                            </div>
                        </div>

                        {tracks.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-primary/10 opacity-40">
                                <Music size={48} className="mb-4" />
                                <span className="font-mono text-xs uppercase tracking-widest">Awaiting Audio Payload Ingestion</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {tracks.map((track) => (
                                    <div key={track.id} className="bg-black/80 border-2 border-primary/10 p-6 flex flex-col gap-4 group hover:border-primary/40 transition-all relative overflow-hidden" 
                                         style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)' }}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-zinc-900 border border-primary/20 flex items-center justify-center relative group-hover:border-primary/50 overflow-hidden">
                                                <img src={track.artwork || 'https://api.dicebear.com/7.x/identicon/svg?seed='+track.id} className="w-full h-full object-cover opacity-60 group-hover:blur-sm" />
                                                <button 
                                                    onClick={() => { setCurrentTrack(track); setIsPlaying(true); }}
                                                    className="absolute inset-0 flex items-center justify-center bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Play size={24} className="text-primary fill-primary" />
                                                </button>
                                            </div>
                                            <div className="flex-1 flex flex-col overflow-hidden">
                                                <h3 className="text-xl font-bebas tracking-widest text-white truncate">{track.title}</h3>
                                                <span className="text-[10px] font-mono text-primary/40 uppercase tracking-widest">{track.artist || 'AUTHENTICATED PILOT'}</span>
                                            </div>
                                            <div className="text-[9px] font-mono text-gray-500 bg-white/5 px-2 py-1 border border-white/5 uppercase">
                                                {track.bpm || '128'} BPM
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center bg-primary/5 p-3 border border-primary/10">
                                            <span className="text-[8px] font-mono text-primary/60 uppercase">Cloud Path: /user_assets/tracks/...</span>
                                            <div className="flex gap-4">
                                                <button className="text-primary/40 hover:text-primary transition-colors"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'script' && (
                    <div className="animate-in slide-in-from-right-8 duration-500">
                        <div className="flex items-center justify-between mb-12 border-b-2 border-primary/20 pb-8">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-primary/10 border border-primary/30 rounded-full">
                                    <FileText className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-3xl md:text-5xl font-black font-bebas tracking-widest uppercase text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">Neural Script</h2>
                                    <p className="font-mono text-[10px] md:text-[11px] text-primary/60 uppercase tracking-[0.5em] font-bold">Lyric Archetypes & Verse Blocks</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {lyrics.length === 0 ? (
                                <div className="col-span-full h-32 flex items-center justify-center border-2 border-dashed border-primary/10 opacity-30 font-mono text-xs uppercase tracking-[1em]">Awaiting Scripts...</div>
                            ) : (
                                lyrics.map(script => (
                                    <div key={script.id} className="bg-zinc-950 border border-primary/20 p-6 flex flex-col gap-4 hover:border-primary/60 transition-colors" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)' }}>
                                        <h4 className="text-lg font-bebas tracking-widest text-white">{script.title || 'ARCHIVED VERSE'}</h4>
                                        <p className="text-[10px] font-mono text-gray-400 line-clamp-3 leading-relaxed tracking-wider italic">"{script.content}"</p>
                                        <span className="text-[8px] font-mono text-primary/30 uppercase mt-auto tracking-[0.2em]">Archived on {new Date(script.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'dna' && (
                    <div className="animate-in slide-in-from-right-8 duration-500">
                        <div className="flex items-center justify-between mb-12 border-b-2 border-primary/20 pb-8">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-primary/10 border border-primary/30 rounded-full">
                                    <Microchip className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-3xl md:text-5xl font-black font-bebas tracking-widest uppercase text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">DNA Sequencer</h2>
                                    <p className="font-mono text-[10px] md:text-[11px] text-primary/60 uppercase tracking-[0.5em] font-bold">Vocal Stem Ingestions & AI Samples</p>
                                </div>
                            </div>
                        </div>
                        
                        {dna.length === 0 ? (
                            <div className="bg-black/90 border-2 border-primary/20 p-12 text-center opacity-40 rounded-3xl" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%)' }}>
                                <Microchip size={64} className="mx-auto text-primary/20 mb-6" />
                                <h3 className="text-2xl font-bebas tracking-widest uppercase mb-4">Awaiting Biometric Data</h3>
                                <p className="font-mono text-[10px] uppercase tracking-widest max-w-sm mx-auto">Upload your dry vocal stems to initiate DNA extraction for AI vocal cloning and neural synthesis.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {dna.map((blueprint) => (
                                    <div key={blueprint.id} className="bg-[#050505] border-2 border-primary/20 p-8 flex flex-col gap-6 group hover:border-primary/60 transition-all shadow-2xl relative" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}>
                                        <div className="flex items-center justify-between">
                                            <div className="p-3 bg-primary/10 rounded-lg">
                                                <Zap className="text-primary w-6 h-6" />
                                            </div>
                                            <span className="text-[10px] font-mono text-primary font-black bg-primary/10 px-3 py-1 border border-primary/20 tracking-widest uppercase italic">Sequenced</span>
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-black font-bebas text-white tracking-widest uppercase mb-1 truncate">{blueprint.fileName || 'Neural Blueprint'}</h4>
                                            <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Acoustic Identity v2.1 // RVC Core</p>
                                        </div>
                                        <div className="space-y-4 pt-4 border-t border-white/5">
                                            <audio src={blueprint.assetUrl} controls className="w-full accent-primary h-8" />
                                            <div className="flex justify-between items-center text-[8px] font-mono text-primary/40 uppercase tracking-widest">
                                                <span>Payload: Acapella Stem</span>
                                                <button className="hover:text-primary transition-colors">Download Blueprint</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'arsenal' && (
                    <div className="animate-in slide-in-from-right-8 duration-500">
                        <div className="flex items-center justify-between mb-12 border-b-2 border-primary/20 pb-8">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-primary/10 border border-primary/30 rounded-full">
                                    <ShoppingBag className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-3xl md:text-5xl font-black font-bebas tracking-widest uppercase text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">Cosmetic Arsenal</h2>
                                    <p className="font-mono text-[10px] md:text-[11px] text-primary/60 uppercase tracking-[0.5em] font-bold">Treasury-Locked Identity Upgrades</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                            {(currentUser.ownedEnhancements || []).length === 0 ? (
                                <div className="col-span-full h-48 flex flex-col items-center justify-center gap-6 bg-primary/5 border border-primary/10 italic rounded-2xl">
                                    <span className="font-mono text-[10px] text-primary/20 uppercase tracking-[0.5em]">Inventory Data Stream Empty</span>
                                    <CyberButton text="COMMERCE TERMINAL" onClick={() => (window.location.href = '/treasury')} className="scale-75" />
                                </div>
                            ) : (
                                (currentUser.ownedEnhancements || []).map((ext) => (
                                    <div key={ext} className="aspect-square bg-zinc-900 border border-primary/30 flex items-center justify-center p-4 relative group" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}>
                                        <ShoppingBag size={32} className="text-primary/20 group-hover:text-primary transition-all" />
                                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="absolute bottom-1 left-2 text-[6px] font-mono text-primary/40 uppercase truncate w-[80%]">{ext}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Pip-Boy Filter Layer (Subtle) */}
            <div className="fixed inset-0 pointer-events-none z-[100] opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_2px]" />
        </div>
    );
}
