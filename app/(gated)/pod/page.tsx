'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { db, storage } from '@/lib/firebase/config';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { User, Zap, Coins, Image as ImageIcon, Video, Trash2, CheckCircle2, Layout, Award, Music, FileText, Microchip, ShoppingBag, Play, Pause, MousePointer2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioStore } from '@/store/useAudioStore';
import { CyberButton } from '@/components/ui/CyberButton';
import CyberGlitchButton from '@/components/ui/CyberGlitchButton';
import CyberGlitchModal from '@/components/ui/CyberGlitchModal';
import AssetMatrix from '@/components/global/AssetMatrix';
import { toast } from 'react-hot-toast';
import { CyberAvatarModal } from '@/components/global/CyberAvatarModal';
import { useRouter } from 'next/navigation';
import MobilePodGallery from '@/components/global/MobilePodGallery';

export default function PrivateMatrix() {
    const { currentUser, isArchitect } = useUserStore();
    const router = useRouter();
    const [isMobileGalleryView, setIsMobileGalleryView] = useState(true);
    const { setCurrentTrack, setPlaylist, isPlaying, setIsPlaying, currentTrack } = useAudioStore();
    const [generations, setGenerations] = useState<any[]>([]);
    const [tracks, setTracks] = useState<any[]>([]);
    const [lyrics, setLyrics] = useState<any[]>([]);
    const [dna, setDna] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'neural' | 'acoustic' | 'script' | 'dna' | 'arsenal'>('neural');
    const [activeBanner, setActiveBanner] = useState<string | null>(null);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

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
        // Fire custom event to spawn the Identity Injector modal with Live Calibration Mode
        window.dispatchEvent(new CustomEvent('OPEN_BANNER_CALIBRATION', { detail: { url } }));
    };

    const equipCursor = async (cursorType: string) => {
        if (!currentUser) return;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, { customCursor: cursorType });
            useUserStore.getState().setUser({ customCursor: cursorType });
        } catch (error) {
            console.error("Failed to update neural pointer:", error);
        }
    };

    const deleteGeneration = async (id: string) => {
        if (!currentUser) return;
        try {
            await deleteDoc(doc(db, 'user_assets', currentUser.uid, 'ai_generations', id));
        } catch (error) {
            console.error("Failed to expunge neural asset:", error);
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
        <div className="relative flex flex-1 w-full flex-col justify-start overflow-visible bg-transparent group/main shrink-0 min-h-max pt-0 pb-0 text-white">
            
            {/* CINEMATIC B-ROLL BACKGROUND LAYER */}
            <div className="fixed inset-0 z-[-1] flex items-center justify-center pointer-events-none overflow-hidden">
                <video 
                    src={`/api/neural-assets?node=MATRIX&pilot=${currentUser?.uid || 'anon'}`}
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover opacity-10 mix-blend-screen blur-[3px] scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050505]/70 to-black z-10" />
            </div>

            {/* NEURAL IDENTITY GATEWAY DELEGATED TO PERSISTENT LAYOUT ENGINE */}

            {/* TACTICAL NAVIGATION (POD CATEGORIES) */}
            <div className="w-full max-w-[1800px] mx-auto px-2 md:px-8 mt-4 z-20">
                <div className="flex sm:grid sm:grid-cols-5 gap-2 md:gap-4 overflow-x-auto pb-2 px-2 md:px-0 scrollbar-none snap-x snap-mandatory">
                    {(['neural', 'acoustic', 'script', 'dna', 'arsenal'] as const).map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)}
                            className={`shrink-0 w-[130px] sm:w-auto snap-center flex flex-col items-center justify-center p-3 md:p-4 transition-all duration-300 border relative overflow-hidden group shadow-[0_5px_15px_rgba(0,0,0,0.5)] ${activeTab === tab ? 'bg-[#00ffff]/10 text-[#00ffff] border-[#00ffff]/80 shadow-[0_0_20px_rgba(0,255,255,0.2)]' : 'bg-[#050505] text-white/70 font-bold border-white/10 hover:border-[#00ffff]/50 hover:bg-[#00ffff]/5 hover:text-white'}`}
                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}
                        >
                            {tab === 'neural' && <ImageIcon size={16} className={`mb-1.5 md:w-[18px] md:h-[18px] ${activeTab === tab ? 'animate-pulse' : ''}`} />}
                            {tab === 'acoustic' && <Music size={16} className={`mb-1.5 md:w-[18px] md:h-[18px] ${activeTab === tab ? 'animate-pulse' : ''}`} />}
                            {tab === 'script' && <FileText size={16} className={`mb-1.5 md:w-[18px] md:h-[18px] ${activeTab === tab ? 'animate-pulse' : ''}`} />}
                            {tab === 'dna' && <Microchip size={16} className={`mb-1.5 md:w-[18px] md:h-[18px] ${activeTab === tab ? 'animate-pulse' : ''}`} />}
                            {tab === 'arsenal' && <ShoppingBag size={16} className={`mb-1.5 md:w-[18px] md:h-[18px] ${activeTab === tab ? 'animate-pulse' : ''}`} />}
                            <span className="font-mono text-[9px] md:text-[10px] items-center text-center font-black uppercase tracking-[0.1em] px-1">
                                {tab === 'neural' ? 'Neural Archives' : 
                                 tab === 'acoustic' ? 'Acoustic Vault' : 
                                 tab === 'script' ? 'Neural Script' : 
                                 tab === 'dna' ? 'DNA Sequencer' : 'Cosmetic Arsenal'}
                            </span>
                            {/* Status Light */}
                            <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${activeTab === tab ? 'bg-[#00ffff] animate-pulse shadow-[0_0_5px_rgba(0,255,255,0.8)]' : 'bg-primary/20'}`} />
                        </button>
                    ))}
                </div>
            </div>

            {/* NEURAL ARCHIVE DECK (AI Generations) */}
            <div className="w-full max-w-[1800px] mx-auto px-4 md:px-8 pt-2 md:pt-6">
                {activeTab === 'neural' && (
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex flex-row items-center justify-between mb-3 md:mb-8 border-b-2 border-primary/20 pb-2 md:pb-4">
                            <div className="flex items-center gap-3 md:gap-6">
                                <div className="p-2.5 md:p-4 bg-primary/10 border border-primary/30 rounded-full shadow-[0_0_15px_rgba(var(--color-primary),0.2)] shrink-0">
                                    <Layout className="w-5 h-5 md:w-8 md:h-8 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-2xl md:text-5xl font-black font-bebas tracking-widest uppercase text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] leading-none">Neural Archives</h2>
                                    <p className="font-mono text-[8px] sm:text-[11px] text-primary/60 uppercase tracking-[0.1em] md:tracking-[0.5em] font-bold italic mt-1 leading-tight pr-4">GPU-Accelerated Visual Identity Payloads</p>
                                </div>
                            </div>
                            <div className="hidden sm:flex gap-4">
                                <CyberButton text="AI FOUNDRY" onClick={() => router.push('/ai')} className="h-14 px-8" />
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
                            <>
                                {/* Mobile Swipe Gallery */}
                                {isMobileGalleryView && (
                                    <div className="block sm:hidden -mx-4">
                                        <MobilePodGallery 
                                            generations={generations}
                                            equipBanner={equipBanner}
                                            deleteGeneration={deleteGeneration}
                                            toggleGridView={() => setIsMobileGalleryView(false)}
                                        />
                                    </div>
                                )}

                                {/* Standard Desktop / Active Grid View */}
                                <div className={`${isMobileGalleryView ? 'hidden sm:grid' : 'grid'} grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8`}>
                                    {!isMobileGalleryView && (
                                        <button onClick={() => setIsMobileGalleryView(true)} className="sm:hidden col-span-full mb-4 text-[10px] font-mono border px-4 py-2 border-primary/20 bg-primary/10 text-primary flex items-center justify-center uppercase font-bold">
                                            REACTIVATE SWIPE DECK VIEW
                                        </button>
                                    )}
                                    {generations.map((gen, i) => (
                                        <AssetMatrix key={gen.id}>
                                            <div 
                                                onClick={() => setLightboxImage(gen.assetUrl)}
                                                className="group relative bg-[#050505] border border-primary/20 transition-all duration-500 hover:border-primary/60 shadow-[0_10px_30px_rgba(0,0,0,0.5)] h-full w-full cursor-zoom-in aspect-[3/4] overflow-hidden rounded-2xl md:rounded-3xl"
                                                style={{ animationDelay: `${i * 50}ms` }}
                                            >
                                                <div className="absolute inset-x-2 top-2 md:inset-x-4 md:top-4 flex justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); equipBanner(gen.assetUrl); }}
                                                        className="bg-black/90 text-[8px] font-mono border border-[#00ffff]/40 text-[#00ffff] px-3 py-2 rounded uppercase tracking-widest hover:bg-[#00ffff] hover:text-black transition-colors shadow-[0_0_15px_rgba(0,255,255,0.3)] backdrop-blur-md"
                                                    >
                                                        BANNER
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); deleteGeneration(gen.id); }}
                                                        className="bg-red-900/40 text-[8px] font-mono border border-red-500/40 text-red-500 px-3 py-2 rounded uppercase tracking-widest hover:bg-red-500 hover:text-black transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)] backdrop-blur-md"
                                                    >
                                                        EXPUNGE
                                                    </button>
                                                </div>

                                                {gen.type === 'deforum' ? (
                                                    <video src={gen.assetUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" muted loop onMouseEnter={(e) => (e.target as HTMLVideoElement).play()} onMouseLeave={(e) => (e.target as HTMLVideoElement).pause()} />
                                                ) : (gen.type === 'vocal_dna' || gen.type === 'neural_swap') ? (
                                                    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#050505] transition-all group-hover:bg-primary/5">
                                                        <div className="mb-4 p-4 bg-primary/10 rounded-full group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(var(--color-primary),0.2)]">
                                                            <Zap className="text-primary w-12 h-12" />
                                                        </div>
                                                        <span className="text-[10px] font-mono text-primary/80 uppercase tracking-widest font-black text-center mb-1">ACOUSTIC PAYLOAD</span>
                                                        <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest text-center">{gen.type.replace('_',' ')}</span>
                                                    </div>
                                                ) : (
                                                    <img src={gen.assetUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" />
                                                )}
                                                
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
                                                
                                                {/* TRADING CARD OVERLAY NATIVE TO GRID */}
                                                <div className="absolute inset-x-2 bottom-2 md:inset-x-4 md:bottom-4 flex flex-col justify-end p-2 md:p-3 bg-black/80 backdrop-blur-md border border-primary/20 rounded-xl shadow-[0_0_30px_rgba(var(--color-primary),0.1)] transition-transform duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none">
                                                    <div className="flex justify-between items-center border-b border-primary/20 pb-1 mb-1">
                                                        <span className="text-[6px] md:text-[8px] font-mono text-white tracking-widest uppercase truncate">{gen.type === 'deforum' ? 'DEFORUM' : 'FLIXSYNTH'}</span>
                                                        <span className="text-[6px] md:text-[8px] font-mono text-primary font-bold">{gen.price > 0 ? `${gen.price}C` : 'UNLISTED'}</span>
                                                    </div>
                                                    <p className="text-[6px] md:text-[7.5px] font-mono text-primary/70 uppercase tracking-widest leading-relaxed line-clamp-2">
                                                        {gen.prompt || 'NO PROMPT'}
                                                    </p>
                                                </div>
                                            </div>
                                        </AssetMatrix>
                                    ))}
                                </div>
                            </>
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
                                    <AssetMatrix key={track.id}>
                                        <div className="bg-[#050505]/90 border border-primary/20 p-6 flex flex-col gap-4 group hover:border-primary/60 transition-all relative overflow-hidden h-full w-full" 
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
                                            <div className="flex justify-between items-center bg-primary/5 p-3 border border-primary/20 mt-auto">
                                                <span className="text-[8px] font-mono text-primary/60 uppercase">Cloud Path: /user_assets/tracks/...</span>
                                                <div className="flex gap-4 relative z-10">
                                                    <button className="text-primary/40 hover:text-red-500 transition-colors pointer-events-auto" onClick={(e) => e.stopPropagation()}><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    </AssetMatrix>
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
                                    <div key={blueprint.id} className="bg-[#050505] border border-primary/20 p-8 flex flex-col gap-6 group hover:border-primary/60 transition-all shadow-2xl relative" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}>
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

                        {/* --- POINTER AESTHETICS --- */}
                        <div className="mt-16 flex items-center justify-between mb-8 border-b-2 border-primary/20 pb-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 border border-primary/30 rounded-full">
                                    <MousePointer2 className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black font-bebas tracking-widest uppercase text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]">Tactical Pointers</h3>
                                    <p className="font-mono text-[9px] text-primary/60 uppercase tracking-[0.4em]">Override Environmental Interface Cursor</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {['crosshair', 'cell', 'alias', 'copy', 'wait', 'crosshair'].map((cursor) => (
                                <button 
                                    key={cursor}
                                    onClick={() => equipCursor(cursor)}
                                    className={`aspect-video border flex flex-col items-center justify-center p-4 transition-all duration-300 shadow-[0_5px_20px_rgba(0,0,0,0.6)] group ${currentUser.customCursor === cursor ? 'bg-primary/20 border-primary cursor-pointer' : 'bg-[#050505] border-white/10 hover:border-primary/50 cursor-pointer'}`}
                                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                                >
                                    <div className="h-10 w-10 flex items-center justify-center mb-2 bg-primary/5 rounded-full group-hover:bg-primary/20 transition-colors" style={{ cursor }}>
                                        <MousePointer2 size={20} className={currentUser.customCursor === cursor ? 'text-primary' : 'text-gray-500 group-hover:text-white'} />
                                    </div>
                                    <span className="font-mono text-[9px] uppercase tracking-widest mt-1 text-center w-full truncate text-gray-400 group-hover:text-white">
                                        {cursor === 'crosshair' ? 'Tactical' : cursor === 'cell' ? 'Vector' : cursor === 'alias' ? 'Neon Node' : cursor === 'copy' ? 'Duplicator' : cursor === 'wait' ? 'Neural Link' : 'Architect'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Pip-Boy Filter Layer (Subtle) */}
            <div className="fixed inset-0 pointer-events-none z-[100] opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_2px]" />
            <CyberAvatarModal />
        </div>
    );
}
