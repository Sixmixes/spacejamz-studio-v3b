'use client';
import { useState, useEffect, useCallback, memo } from 'react';
import { Play, Pause, Trash2, GripVertical, Radio, Edit2, ArrowUp, Activity, Check, X, Save, Scissors } from 'lucide-react';
import { useAudioStore } from '@/store/useAudioStore';
import { CyberButton } from '@/components/ui/CyberButton';
import NeuralIdentityTerminal from '@/components/global/NeuralIdentityTerminal';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

import type { Modifier } from '@dnd-kit/core';

const restrictToVerticalAxis: Modifier = ({ transform }) => {
  return { ...transform, x: 0 };
};

const ARCHITECT_SUITE_TRACKS: any[] = [];

const SortableTrackItem = memo(function SortableTrackItem({ track, index, isThisPlaying, playTestTrack, removeTrack, desyncClass, bumpToTop, analyzeTrack, isAnalyzing, updateTrackMetadata, extractDemucsStems, isExtractingDemucs }: any) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: track.id });
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(track.title || '');
    const [editProducer, setEditProducer] = useState(track.producer || '');
    
    // Scale slightly when grabbing to simulate "picking it up" out of the viewport
    const style = { 
        transform: CSS.Transform.toString(transform), 
        transition, 
        zIndex: isDragging ? 50 : 1 
    };

    const handleSave = (e: any) => {
        e.stopPropagation();
        if (updateTrackMetadata) {
            updateTrackMetadata(track.id, editTitle, editProducer);
        } else {
            track.title = editTitle;
            track.producer = editProducer;
        }
        setIsEditing(false);
    };

    return (
        <div
            ref={setNodeRef}
            style={{ ...style, clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)' }}
            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 md:p-6 transition-all duration-300 bg-black/60 backdrop-blur-md border border-solid border-primary/20 shadow-[inset_0_0_20px_rgba(var(--color-primary),0.05)] ${desyncClass} ${isThisPlaying ? 'active-playback bg-primary/10 border-primary/60' : 'hover:border-primary/40'} ${isDragging ? 'opacity-80 scale-[1.02] shadow-[0_0_30px_rgba(var(--color-primary),0.3)]' : ''}`}
        >
            <div className="flex items-center gap-2 sm:gap-6 cursor-pointer flex-1 min-w-0" onClick={() => !isEditing && playTestTrack(track)}>
                
                {/* Massive Physical Thumb Gripper for Mobile */}
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing hover:text-primary text-gray-500 hover:bg-white/5 transition-all p-2 -ml-2 sm:p-2 sm:-ml-0 rounded-lg touch-none" onClick={(e) => e.stopPropagation()}>
                    <GripVertical size={20} className="sm:hidden" />
                    <GripVertical size={24} className="hidden sm:block" />
                </div>
                
                <div className={`w-10 h-10 sm:w-14 sm:h-14 flex shrink-0 items-center justify-center transition-all duration-300 rounded-xl ${isThisPlaying ? 'bg-[#00ffff] text-black shadow-[0_0_20px_rgba(0,255,255,0.5)]' : 'bg-[#00ffff]/5 text-[#00ffff] border border-[#00ffff]/30'}`}>
                    {isThisPlaying ? <Pause size={16} className="fill-current sm:w-5 sm:h-5" /> : <Play size={16} className="fill-current ml-1 sm:w-5 sm:h-5" />}
                </div>
                
                <div className="flex flex-col min-w-0 flex-1 pr-1 sm:pr-4" onClick={(e) => isEditing && e.stopPropagation()}>
                    {isEditing ? (
                        <div className="flex flex-col gap-1 sm:gap-2">
                            <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="bg-black/80 border border-primary/40 px-2 py-1 text-xs sm:text-base md:text-xl font-bebas text-white focus:outline-none focus:border-primary w-full" placeholder="TRACK TITLE" />
                            <input type="text" value={editProducer} onChange={e => setEditProducer(e.target.value)} className="bg-black/80 border border-white/20 px-2 py-1 text-[9px] sm:text-[10px] font-mono text-gray-400 focus:outline-none focus:border-white/60 w-full" placeholder="PRODUCER / SOURCE" />
                        </div>
                    ) : (
                        <>
                            <span className="font-bebas text-xl sm:text-2xl md:text-3xl uppercase tracking-widest text-white truncate leading-none">{track.title}</span>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="font-mono text-[8px] sm:text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest truncate">
                                    SRC: <span className="text-primary/80">{track.producer}</span>
                                </span>
                                {(track.bpm || track.key) && (
                                    <div className="flex items-center gap-1.5 sm:ml-2">
                                        {track.bpm && <span className="font-mono text-[7px] sm:text-[8px] text-white/90 border border-white/20 bg-white/10 px-1.5 py-0.5 rounded tracking-widest">{track.bpm} BPM</span>}
                                        {track.key && <span className="font-mono text-[7px] sm:text-[8px] text-cyan-400 border border-cyan-500/30 bg-cyan-900/40 px-1.5 py-0.5 rounded tracking-widest hidden xs:inline">KEY: {track.key}</span>}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-[2px] sm:gap-2 shrink-0 ml-[3.5rem] mt-3 sm:mt-0 sm:ml-0 justify-end flex-wrap sm:flex-nowrap">
                {isEditing ? (
                    <>
                        <button onClick={handleSave} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-green-500/20 text-green-500 transition-all duration-300 border border-green-500/20" title="Save Metadata">
                            <Check size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setIsEditing(false); }} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-white/10 text-gray-400 transition-all duration-300 border border-white/10" title="Cancel">
                            <X size={14} />
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-300 border border-white/10" title="Edit Metadata">
                            <Edit2 size={14} />
                        </button>
                        
                        {index > 0 && (
                            <button onClick={(e) => { e.stopPropagation(); bumpToTop(track.id); }} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-primary/20 text-primary transition-all duration-300 border border-primary/20" title="Bump to Top">
                                <ArrowUp size={14} />
                            </button>
                        )}

                        <button onClick={(e) => { e.stopPropagation(); extractDemucsStems(track); }} className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center transition-all duration-300 border ${isExtractingDemucs ? 'border-blue-500/50 bg-blue-500/20 text-blue-400' : 'border-blue-500/20 hover:bg-blue-500/20 text-blue-500/70 hover:text-blue-400'}`} title="Demucs Neural Extraction">
                            <Scissors size={14} className={isExtractingDemucs ? 'animate-pulse' : ''} />
                        </button>

                        <button onClick={(e) => { e.stopPropagation(); analyzeTrack(track); }} className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center transition-all duration-300 border ${isAnalyzing ? 'border-purple-500/50 bg-purple-500/20 text-purple-400' : 'border-purple-500/20 hover:bg-purple-500/20 text-purple-500/70 hover:text-purple-400'}`} title="Run Deep DSP Analyzer">
                            <Activity size={14} className={isAnalyzing ? 'animate-spin' : ''} />
                        </button>

                        <button onClick={(e) => { e.stopPropagation(); removeTrack(track.id); }} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-red-500/10 hover:bg-red-500 rounded-lg text-red-500 hover:text-white transition-all duration-300 border border-solid border-red-500/30" title="Purge Track">
                            <Trash2 size={14} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
});

export default function V3BHome() {
    const currentTrack = useAudioStore(state => state.currentTrack);
    const isPlaying = useAudioStore(state => state.isPlaying);
    const reactivitySensitivity = useAudioStore(state => state.reactivitySensitivity);
    const reactivityThreshold = useAudioStore(state => state.reactivityThreshold);
    const targetFrequency = useAudioStore(state => state.targetFrequency);
    const isShuffleToggle = useAudioStore(state => state.isShuffleToggle);
    const shuffledQueue = useAudioStore(state => state.shuffledQueue);
    const queueIndex = useAudioStore(state => state.queueIndex);
    const playlist = useAudioStore(state => state.playlist);
    
    const setCurrentTrack = useAudioStore(state => state.setCurrentTrack);
    const setIsPlaying = useAudioStore(state => state.setIsPlaying);
    const setPlaylist = useAudioStore(state => state.setPlaylist);
    const setReactivitySensitivity = useAudioStore(state => state.setReactivitySensitivity);
    const setReactivityThreshold = useAudioStore(state => state.setReactivityThreshold);
    const setTargetFrequency = useAudioStore(state => state.setTargetFrequency);
    const setAnalyzerMode = useAudioStore(state => state.setAnalyzerMode);
    const analyzerMode = useAudioStore(state => state.analyzerMode);

    const [linkInput, setLinkInput] = useState('');
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'analyzing'>('idle');
    const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
    
    // The master visual array
    const [dynamicTracks, setDynamicTracks] = useState<any[]>(ARCHITECT_SUITE_TRACKS);
    const [analyzingTrackId, setAnalyzingTrackId] = useState<string | null>(null);
    const [extractingTrackId, setExtractingTrackId] = useState<string | null>(null);
    const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);
    const [isSavingCalibration, setIsSavingCalibration] = useState(false);

    const commitToFirebase = useCallback(async (newTracks: any[]) => {
        if (!db) return;
        try {
            const savable = newTracks.filter(t => !t.src?.startsWith('blob:'));
            await setDoc(doc(db, 'config', 'global_audio'), { 
                playlist: savable
            }, { merge: true });
        } catch (e: any) {
            if (e?.code === 'permission-denied') {
                console.warn("[AUTH] Matrix sync bypassed: Read-only terminal access active. Operating via local memory.");
            } else {
                console.warn("Failed to sync to Matrix:", e);
            }
        }
    }, []);

    useEffect(() => {
        if (!db) return;
        const unsub = onSnapshot(doc(db, 'config', 'global_audio'), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.playlist && Array.isArray(data.playlist)) {
                    setDynamicTracks(data.playlist);
                }
                
                // GLOBAL SYNC OVERRIDE PROTOCOL
                // Inject external config updates directly into live memory
                if (data.reactivitySensitivity !== undefined) setReactivitySensitivity(data.reactivitySensitivity);
                if (data.reactivityThreshold !== undefined) setReactivityThreshold(data.reactivityThreshold);
                if (data.targetFrequency) setTargetFrequency(data.targetFrequency);
                if (data.analyzerMode) setAnalyzerMode(data.analyzerMode);
            }
        });
        return () => unsub();
    }, []);

    const updateTrackMetadata = useCallback((id: string, title: string, producer: string) => {
        setDynamicTracks(prev => {
            const newArr = prev.map(t => t.id === id ? { ...t, title, producer } : t);
            commitToFirebase(newArr);
            return newArr;
        });
    }, [commitToFirebase]);

    const handleRemoveTrack = useCallback((id: string) => {
        setDynamicTracks(prev => {
            const newArr = prev.filter(t => t.id !== id);
            commitToFirebase(newArr);
            return newArr;
        });
    }, [commitToFirebase]);

    // Initialize DND sensors (allow tiny movement tolerance so clicks still work)
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = dynamicTracks.findIndex((i) => i.id === active.id);
            const newIndex = dynamicTracks.findIndex((i) => i.id === over.id);
            const reordered = arrayMove(dynamicTracks, oldIndex, newIndex);
            
            setDynamicTracks(reordered);
            
            // Sync external store and DB outside of React's set-state batch cycle
            if (!isPlaying) setPlaylist(reordered);
            commitToFirebase(reordered);
        }
    };

    const playTestTrack = useCallback((track: any) => {
        // Send our newly sorted tracks to the main audio engine memory
        setPlaylist(dynamicTracks);
        
        const state = useAudioStore.getState();
        if (state.currentTrack?.id === track.id) {
            state.setIsPlaying(!state.isPlaying);
        } else {
            state.setCurrentTrack(track);
            state.setIsPlaying(true);
        }
    }, [dynamicTracks, setPlaylist]);

    const bumpToTop = useCallback((id: string) => {
        setDynamicTracks(prev => {
            const index = prev.findIndex(t => t.id === id);
            if (index <= 0) return prev;
            
            const newArr = [...prev];
            const [item] = newArr.splice(index, 1);
            newArr.unshift(item);
            
            // Sync external store and DB outside of React's set-state batch cycle
            if (!useAudioStore.getState().isPlaying) setPlaylist(newArr);
            commitToFirebase(newArr);
            return newArr;
        });
    }, [setPlaylist, commitToFirebase]);

    const analyzeTrack = useCallback(async (track: any) => {
        if (!track.src) return;
        setAnalyzingTrackId(track.id);
        try {
            const proxyUrl = track.src.startsWith('/trip.mp3') ? track.src : (track.src.startsWith('/api/proxy') ? track.src : `/api/proxy?url=${encodeURIComponent(track.src)}`);
            const res = await fetch(proxyUrl);
            const arrayBuffer = await res.arrayBuffer();
            
            const { analyzeAudioBuffer } = await import('@/lib/utils/audioAnalyzer');
            const { bpm, key, normalizationGain } = await analyzeAudioBuffer(arrayBuffer);
            
            setDynamicTracks(prev => {
                const newArr = prev.map(t => {
                    if (t.id === track.id) {
                        const updated = { ...t, bpm: parseInt(bpm) || 120, key, normalizationGain };
                        const state = useAudioStore.getState();
                        if (state.currentTrack && state.currentTrack.id === track.id) {
                            state.setCurrentTrack(updated); // Sync active store instantly so gain hits right away
                        }
                        return updated;
                    }
                    return t;
                });
                commitToFirebase(newArr);
                return newArr;
            });
        } catch (err) {
            console.error("DSP Direct Analyzer Error:", err);
            // Ignore UI errors on manual press and let it fail gracefully
        } finally {
            setAnalyzingTrackId(null);
        }
    }, [commitToFirebase]);

    const extractDemucsStems = useCallback(async (track: any) => {
        if (!track.src) return;
        setExtractingTrackId(track.id);
        
        try {
            const formData = { audioUrl: track.src };
            const res = await fetch('/api/studio/demucs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Neural Extraction Failed");
            }

            const data = await res.json();
            const stemsObj = data.stems;
            
            const newTracks: any[] = [];
            for (const [stemName, stemUrl] of Object.entries(stemsObj)) {
                newTracks.push({
                    id: crypto.randomUUID(),
                    title: `${track.title} [${stemName.toUpperCase()}]`,
                    producer: 'DEMUCS NEURAL ENGINE',
                    src: stemUrl as string,
                    status: 'isolated'
                });
            }

            setDynamicTracks(prev => {
                const newArr = [...newTracks, ...prev];
                commitToFirebase(newArr);
                if (!useAudioStore.getState().isPlaying) setPlaylist(newArr);
                return newArr;
            });

            alert("GLOBAL BROADCAST: Demucs Neural Extraction Complete. 4 Stems Isolated.");

        } catch (err: any) {
            console.error("Demucs Extractor Error:", err);
            alert("EXTRACTION OVERLOAD: " + err.message);
        } finally {
            setExtractingTrackId(null);
        }
    }, [commitToFirebase, setPlaylist]);

    const analyzeAllTracks = async () => {
        if (isAnalyzingAll) return;
        setIsAnalyzingAll(true);
        try {
            // Find all pending tracks that haven't been successfully analyzed (i.e. default BPM or missing Gain)
            const tracksToAnalyze = dynamicTracks.filter(t => !t.normalizationGain);
            
            for (const track of tracksToAnalyze) {
                if (!track.src) continue;
                setAnalyzingTrackId(track.id);
                
                const proxyUrl = track.src.startsWith('/trip.mp3') ? track.src : (track.src.startsWith('/api/proxy') ? track.src : `/api/proxy?url=${encodeURIComponent(track.src)}`);
                const res = await fetch(proxyUrl);
                const arrayBuffer = await res.arrayBuffer();
                
                const { analyzeAudioBuffer } = await import('@/lib/utils/audioAnalyzer');
                const { bpm, key, normalizationGain } = await analyzeAudioBuffer(arrayBuffer);
                
                // Allow the React state cycle to process synchronously before moving to the next heavy decode
                await new Promise<void>(resolve => {
                    setDynamicTracks(prev => {
                        const newArr = prev.map(t => {
                            if (t.id === track.id) {
                                const updated = { ...t, bpm: parseInt(bpm) || 120, key, normalizationGain };
                                return updated;
                            }
                            return t;
                        });
                        commitToFirebase(newArr);
                        resolve();
                        return newArr;
                    });
                });
            }
        } catch (err) {
            console.error("DSP Batch Analyzer Error:", err);
        } finally {
            setAnalyzingTrackId(null);
            setIsAnalyzingAll(false);
        }
    };

    const handleUrlSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!linkInput) return;
        
        setUploadStatus('analyzing');
        try {
            const { analyzeExternalLink } = await import('@/lib/utils/audioAnalyzer');
            const newTrack = await analyzeExternalLink(linkInput);
            
            const newPlaylist = [newTrack, ...dynamicTracks];
            setDynamicTracks(newPlaylist);
            commitToFirebase(newPlaylist);
            setLinkInput('');
            
            // Only update the global player queue array, do not override or stop the active listening session
            setPlaylist(newPlaylist);
            setIsIngestModalOpen(false);
        } catch(err: any) {
            console.error(err);
            alert("Ingestion Error: " + err.message);
        } finally {
            setUploadStatus('idle');
        }
    };

    // --- UP NEXT QUEUE LOGIC ---
    let upNextTrack = null;
    if (playlist.length > 0 && currentTrack) {
        if (isShuffleToggle && shuffledQueue.length > 0) {
            // Find what's next in the randomized deck
            const nextIdx = (queueIndex + 1) % shuffledQueue.length;
            const nextId = shuffledQueue[nextIdx];
            upNextTrack = playlist.find(t => t.id === nextId);
        } else {
            // Standard linear queue
            const idx = playlist.findIndex((t) => t.id === currentTrack.id);
            if (idx !== -1) {
                upNextTrack = playlist[(idx + 1) % playlist.length];
            }
        }
    }

    return (
        <div className="flex flex-col items-center justify-start min-h-screen pt-32 pb-48 relative overflow-hidden bg-transparent">
            
            {/* CINEMATIC B-ROLL BACKGROUND LAYER */}
            <div className="fixed inset-0 z-[-1] flex items-center justify-center pointer-events-none overflow-hidden">
                <video 
                    src={`/api/neural-assets?node=VAULT&pilot=${currentUser?.uid || 'anon'}`}
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover opacity-20 mix-blend-screen scale-110 blur-[2px]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050505]/80 to-black z-10" />
            </div>

            <div className="absolute top-8 left-0 right-0 z-[100] pointer-events-none px-4 md:px-8">
                <NeuralIdentityTerminal className="pointer-events-auto shadow-[0_30px_60px_rgba(0,0,0,0.8)]" />
            </div>

            {/* Massive Outer Cyber Panel -> Glassmorphism / RIG ARCHITECTURE */}
            <div className="bg-[#050505]/80 backdrop-blur-xl border-2 border-solid border-primary/20 p-8 md:p-14 w-full max-w-[1800px] mx-auto px-4 md:px-8 mb-24 z-50 overflow-hidden desync-1 shadow-[0_40px_100px_rgba(0,0,0,0.9)]" 
                 style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)' }}>
                
                {/* UP NEXT QUEUE LOGIC & TELEMETRY VAULT (MOVED TO TOP) */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-10 pb-8 border-b-2 border-primary/20">
                    <div className="flex flex-col gap-2">
                         <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-widest font-bebas drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] italic">Neural Audio Gateway</h2>
                         <div className="flex items-center gap-4 mt-1">
                             <p className="text-[10px] md:text-[11px] text-primary/60 font-mono tracking-[0.4em] uppercase font-black">Target Payload Processing Node</p>
                             {isShuffleToggle && <span className="text-black font-black text-[9px] font-mono bg-primary px-3 py-1 tracking-widest shadow-[0_0_15px_rgba(var(--color-primary),0.5)]">SMART SHUFFLE ACTIVE</span>}
                         </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={analyzeAllTracks} 
                            disabled={isAnalyzingAll}
                            className={`font-mono text-[10px] px-6 py-3 border-2 transition-all font-black tracking-widest uppercase ${isAnalyzingAll ? 'border-primary/50 text-white animate-pulse bg-primary/20 shadow-[0_0_20px_rgba(var(--color-primary),0.3)]' : 'border-white/20 text-gray-400 hover:text-white hover:border-primary/60 hover:bg-primary/5'}`}
                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                        >
                            {isAnalyzingAll ? 'ANALYZING BATCH...' : 'ANALYZE ARRAY'}
                        </button>
                        <CyberButton onClick={() => setIsIngestModalOpen(true)} text="Acquire Target Data" className="h-12 px-8" />
                    </div>
                </div>

                {upNextTrack && (
                    <div className="mb-8 rounded-none p-5 flex items-center gap-6 border border-solid border-primary/40 bg-primary/10 backdrop-blur-md shadow-[0_0_30px_rgba(var(--color-primary),0.1)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-1 h-full bg-primary animate-pulse" />
                        <div className="absolute -inset-4 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <div className="w-14 h-14 bg-black/80 border-2 border-primary/40 flex items-center justify-center flex-shrink-0 relative group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(var(--color-primary),0.3)]" style={{ clipPath: 'polygon(0 0, 100% 0, 100%calc(100%-10px), calc(100%-10px) 100%, 0 100%)' }}>
                            <Radio className="w-6 h-6 text-primary drop-shadow-[0_0_8px_rgba(var(--color-primary),0.8)] animate-pulse" />
                        </div>
                        <div className="flex flex-col min-w-0 pr-4 relative z-10">
                             <span className="text-[10px] font-mono text-primary/80 tracking-[0.4em] uppercase mb-1 cyber-flicker-slow font-black">Queued Decryption Protocol</span>
                             <span className="text-white text-lg sm:text-2xl font-black font-bebas uppercase tracking-widest truncate drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]">{upNextTrack.title}</span>
                        </div>
                    </div>
                )}
                
                {/* CONSTRAINED DND TRACK LIST ARRAY */}
                <div className="h-[360px] overflow-y-auto pr-2 sm:pr-4 -mr-2 sm:-mr-4 mb-10 relative z-10 custom-scrollbar scanlines pt-1 pb-4 border-b border-[#00ffff]/20" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,255,255, 0.5) transparent' }}>
                    <DndContext sensors={sensors} modifiers={[restrictToVerticalAxis]} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={dynamicTracks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                            <div className="flex flex-col gap-3">
                                {dynamicTracks.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 font-mono text-xs uppercase tracking-widest border border-solid border-[#00ffff]/20 rounded-2xl bg-black/20 backdrop-blur-sm shadow-[inset_0_0_20px_rgba(0,255,255,0.05)]">
                                        <Radio className="mb-4 opacity-70 text-[#00ffff]" size={32} />
                                        Audio Vault Empty
                                        <span className="text-[9px] mt-2 opacity-60 text-center px-4">Intercept a target signal to populate the neural matrix.</span>
                                    </div>
                                ) : (
                                    dynamicTracks.map((track, i) => {
                                        const isThisPlaying = currentTrack?.id === track.id && isPlaying;
                                        const variantDelay = `desync-${(i % 5) + 1}`;
                                        
                                        return (
                                        <SortableTrackItem 
                                            key={track.id} 
                                            index={i}
                                            track={track} 
                                            isThisPlaying={isThisPlaying} 
                                            playTestTrack={playTestTrack} 
                                            removeTrack={handleRemoveTrack}
                                            desyncClass={variantDelay}
                                            bumpToTop={bumpToTop}
                                            analyzeTrack={analyzeTrack}
                                            isAnalyzing={analyzingTrackId === track.id}
                                            extractDemucsStems={extractDemucsStems}
                                            isExtractingDemucs={extractingTrackId === track.id}
                                            updateTrackMetadata={updateTrackMetadata}
                                        />
                                    );
                                })
                                )}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>

                {/* Header Sequence - Audio Reactivity Test */}
                <div className="flex flex-col sm:flex-row justify-between items-start mb-6 pb-2 gap-4">
                    <div>
                        <h1 className="font-bebas text-3xl sm:text-4xl text-white tracking-widest mb-1 drop-shadow-[0_0_15px_rgba(var(--color-primary),0.8)]">Audio Reactivity Engine</h1>
                        <p className="font-mono text-[9px] sm:text-[10px] text-primary uppercase tracking-[0.3em] cyber-flicker-slow">[ SYSTEM ARCHITECTURE V3B : ACTIVE TUNING ]</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-6">
                        <button 
                            onClick={async () => {
                                setIsSavingCalibration(true);
                                if (db) {
                                    try {
                                        await setDoc(doc(db, 'config', 'global_audio'), {
                                            reactivitySensitivity,
                                            reactivityThreshold,
                                            targetFrequency,
                                            analyzerMode
                                        }, { merge: true });
                                    } catch(e: any) {
                                        if (e?.code === 'permission-denied') console.warn("Firebase Auth blocked global sitewide deployment. Running locally.");
                                    }
                                }
                                setTimeout(() => setIsSavingCalibration(false), 800);
                            }}
                            disabled={isSavingCalibration}
                            className={`flex items-center gap-2 font-mono text-[10px] sm:text-xs uppercase tracking-widest px-4 py-2 border transition-all duration-300 ${isSavingCalibration ? 'bg-primary text-black border-primary shadow-[0_0_20px_rgba(var(--color-primary),1)]' : 'bg-transparent text-gray-400 border-white/20 hover:border-primary hover:text-white hover:bg-white/5'}`}
                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}
                        >
                            {isSavingCalibration ? <Check size={14} className="animate-in zoom-in" /> : <Save size={14} />} 
                            {isSavingCalibration ? 'CALIBRATION LOCKED' : 'LOCK SETTINGS'}
                        </button>
                        
                        <div className="flex flex-col items-end gap-1 hidden sm:flex">
                            <div className="w-16 h-1 bg-primary/20 overflow-hidden" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 20% 100%)' }}>
                                <div className="h-full bg-primary transition-all duration-75" style={{ width: `calc(var(--audio-intensity, 0) * 100%)` }} />
                            </div>
                            <span className="font-mono text-[8px] text-primary/60 tracking-tighter uppercase">Signal Output 100%</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 bg-black/50 p-4 border-l-2 border-primary/50 font-mono text-[9px] text-gray-500 uppercase tracking-widest cyber-card flex-row desync-2">
                    <div className="flex flex-col gap-1 pr-4">
                        <span className="text-white/40">NEURAL KERNEL</span>
                        <span className="text-primary truncate cyber-flicker-fast">SPACEJAMZ-CORE-V3B</span>
                    </div>
                    <div className="flex flex-col gap-1 pl-2">
                        <span className="text-white/40">ENGINE STATUS</span>
                        <span className="text-green-500 flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-green-500 animate-ping" /> CALIBRATED</span>
                    </div>
                </div>

                {/* SENSITIVITY CONTROLS */}
                <div className="flex flex-col gap-6 mb-2 cyber-card p-6 md:p-8 desync-3">
                    <div className="absolute inset-0 bg-primary/5 transition-opacity duration-300 pointer-events-none" style={{ opacity: `calc(var(--audio-intensity, 0) * 0.3)` }} />

                    <div className="flex flex-col gap-2 relative z-10">
                        <div className="flex justify-between items-center text-[10px] font-mono text-primary tracking-widest uppercase mb-1 drop-shadow-[0_0_5px_rgba(var(--color-primary),0.4)]">
                            <span>SENSITIVITY: {reactivitySensitivity.toFixed(1)}x</span>
                            <span>[ AMPLIFICATION ]</span>
                        </div>
                        <input type="range" min="0.5" max="10.0" step="0.1" value={reactivitySensitivity} onChange={(e) => setReactivitySensitivity(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-none appearance-none cursor-pointer accent-primary border-t border-b border-white/5" />
                    </div>
                    <div className="flex flex-col gap-2 relative z-10">
                        <div className="flex justify-between items-center text-[10px] font-mono text-primary tracking-widest uppercase mb-1 drop-shadow-[0_0_5px_rgba(var(--color-primary),0.4)]">
                            <span>THRESHOLD: {reactivityThreshold.toFixed(2)}</span>
                            <span>[ NEURAL GATE ]</span>
                        </div>
                        <input type="range" min="0.0" max="0.8" step="0.01" value={reactivityThreshold} onChange={(e) => setReactivityThreshold(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-none appearance-none cursor-pointer accent-primary border-t border-b border-white/5" />
                    </div>

                    <div className="flex flex-col gap-3 relative z-10 mt-2">
                        <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 tracking-widest uppercase">
                            <span>REACTIVE BAND TARGETING</span>
                            <span className="text-primary/60 text-[10px] sm:text-[12px] cyber-flicker-slow">[ {targetFrequency.toUpperCase()} ]</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {(['all', 'bass', 'mid', 'high'] as const).map((freq) => {
                                const isActive = targetFrequency === freq;
                                return (
                                    <button key={freq} onClick={() => setTargetFrequency(freq)} className={`relative py-2 font-mono text-[10px] tracking-tighter transition-all duration-300 border overflow-hidden ${isActive ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(var(--color-primary),0.4)] font-bold' : 'bg-black/60 text-gray-400 border-white/10 hover:border-primary/40 hover:bg-white/5 hover:text-white'}`} style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}>
                                        <div className="absolute bottom-0 left-0 right-0 bg-primary/30 pointer-events-none transition-all duration-75" style={{ height: freq === 'all' ? 'calc(var(--audio-intensity, 0) * 100%)' : `calc(var(--audio-${freq}, 0) * 100%)`, opacity: isActive ? '0.4' : '0.1' }} />
                                        <span className="relative z-10">{freq.toUpperCase()}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex flex-col gap-3 relative z-10 mt-2 border-t border-white/5 pt-6">
                            <div className="flex justify-between items-center text-[10px] font-mono text-primary/80 tracking-[0.3em] uppercase font-black">
                                <span>ANALYZER RESOLUTION (FFT)</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {(['default', 'high', 'extreme'] as const).map((mode) => {
                                    const isActive = analyzerMode === mode;
                                    return (
                                        <button key={mode} onClick={() => setAnalyzerMode(mode)} className={`py-2 font-mono text-[10px] tracking-tighter transition-all duration-300 border ${isActive ? 'bg-primary/20 text-primary border-primary/50 shadow-[0_0_15px_rgba(var(--color-primary),0.2)]' : 'bg-black/60 text-gray-400 border-white/10 hover:border-primary/40'}`}>
                                            {mode.toUpperCase()}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                    </div>

                    {/* LIVE SIGNAL METER */}
                    <div className="mt-6 pt-6 border-t border-white/10 relative z-10">
                        <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 tracking-widest uppercase mb-3">
                            <span>REALTIME SIGNAL TRANSMISSION</span>
                            <span className={isPlaying ? 'text-primary cyber-flicker-fast drop-shadow-[0_0_8px_rgba(var(--color-primary),0.8)]' : 'text-red-500'}>
                                {isPlaying ? `[ ONLINE : ${(100 - (reactivityThreshold * 200)).toFixed(0)}% GATEWAY ]` : '[ STANDBY ]'}
                            </span>
                        </div>
                        <div className="flex gap-[2px] h-4 items-end bg-black/60 p-1 border border-white/5 overflow-hidden" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}>
                            {[...Array(60)].map((_, i) => {
                                const thresholdPos = Math.round(reactivityThreshold * 150); 
                                const isThresholdMarker = i === thresholdPos;
                                return (
                                    <div key={i} className="flex-1 transition-all duration-75" style={{ height: isThresholdMarker ? '100%' : '60%', backgroundColor: isThresholdMarker ? '#ef4444' : `rgb(var(--color-primary) / ${i/60})`, opacity: isPlaying ? `calc(0.1 + (var(--audio-signal-raw, 0) * 2 * ${i/20 > 1 ? 0.5 : 1}))` : '0.05', filter: isThresholdMarker ? 'drop-shadow(0 0 5px rgba(239, 68, 68, 0.5))' : 'none' }} />
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* INGESTION MODAL OVERLAY */}
            {isIngestModalOpen && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center pointer-events-auto">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300 scanlines opacity-60" onClick={() => setIsIngestModalOpen(false)} />
                    
                    <div className="relative w-[90%] max-w-2xl bg-black/90 p-8 cyber-panel shadow-[0_0_100px_rgba(var(--color-primary),0.2)] flex flex-col gap-6 animate-in zoom-in-95 fade-in duration-200">
                        <div className="absolute top-0 right-0 p-4">
                            <button className="text-gray-500 hover:text-white transition-colors" onClick={() => setIsIngestModalOpen(false)}>
                                <span className="absolute top-4 right-4 text-xs font-mono border border-white/20 px-2 py-1 bg-white/5">ESC</span>
                            </button>
                        </div>

                        <div className="flex flex-col gap-1">
                            <h3 className="text-primary font-black text-2xl uppercase tracking-[0.15em] font-mono mb-2 border-b border-primary/20 pb-4 cyber-flicker-fast">
                                Intercept External Signal
                            </h3>
                            <p className="text-[10px] text-gray-400 font-mono tracking-widest leading-relaxed">
                                PASTE A DIRECT LINK TO A TARGET STREAM. THE NEURAL ENGINE WILL DECRYPT, NORMALIZE IT TO -11 LUFS, AND ALIGN IT TO THE MASTER QUEUE.
                            </p>
                        </div>

                        <form onSubmit={handleUrlSubmit} className="flex flex-col gap-4 mt-4 relative z-20">
                            <input 
                                type="text" 
                                placeholder="https://..."
                                value={linkInput}
                                onChange={(e) => setLinkInput(e.target.value)}
                                disabled={uploadStatus === 'analyzing'}
                                autoFocus
                                className="w-full bg-black/60 border-[1.5px] border-white/10 px-6 py-5 text-sm font-mono text-white placeholder-gray-700 focus:outline-none focus:border-primary/80 transition-all cyber-card"
                            />
                            
                            <div className="flex justify-end mt-4">
                                <CyberButton type="submit" disabled={!linkInput || uploadStatus === 'analyzing'} text={uploadStatus === 'analyzing' ? 'DECODING...' : 'INJECT SIGNAL'} />
                            </div>
                        </form>
                        
                        <div className="absolute bottom-4 left-6 flex flex-col gap-[2px] pointer-events-none opacity-50 mix-blend-screen hidden sm:flex">
                            <span className="font-mono text-[7px] text-primary tracking-[0.2em] uppercase cyber-flicker-slow">Boot Sequence V1.04</span>
                            <span className="font-mono text-[7px] text-gray-400 tracking-[0.3em] uppercase animate-pulse">Memory Card: Decrypted</span>
                            <span className="font-mono text-[7px] text-gray-500 tracking-[0.4em] uppercase">SYSTEM: SCEA-001 (OK)</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
