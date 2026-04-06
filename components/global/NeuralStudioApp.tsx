'use client';

import React, { useState, useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { Sparkles, Video, UserPlus, Lock, Zap, Coins, Image as ImageIcon, AlertCircle, Loader2, Cpu, Terminal, CheckCircle2, Database, Trash2, Save, X } from 'lucide-react';
import { CyberButton } from '@/components/ui/CyberButton';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';

import { db, storage } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import FlixSynthPanel from '@/components/neural/FlixSynthPanel';
import VocalDnaPanel from '@/components/neural/VocalDnaPanel';
import NeuralSwapPanel from '@/components/neural/NeuralSwapPanel';
import RAPGSlotMachine from '@/components/neural/RAPGSlotMachine';

type NeuralState = 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR';

export default function NeuralStudioApp({ embeddedFlixSynthOnly = false, onEmbeddedClose }: { embeddedFlixSynthOnly?: boolean, onEmbeddedClose?: () => void }) {
    const { currentUser, isArchitect, setUser } = useUserStore();
    const [activeTab, setActiveTab] = useState<'flixsynth' | 'deforum' | 'vocal_dna' | 'neural_swap'>('flixsynth');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [faceImage, setFaceImage] = useState<File | null>(null);
    const [facePreview, setFacePreview] = useState<string | null>(null);
    const [neuralState, setNeuralState] = useState<NeuralState>('IDLE');
    const [statusMsg, setStatusMsg] = useState('');
    const [lastOutput, setLastOutput] = useState<string | null>(null);
    const [batchSize, setBatchSize] = useState(1);
    const [batchUrls, setBatchUrls] = useState<string[]>([]);
    const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
    const [isBatchMode, setIsBatchMode] = useState(false);
    const [vocalStem, setVocalStem] = useState<File | null>(null);
    const [vocalStemName, setVocalStemName] = useState<string | null>(null);
    const [consentLikeness, setConsentLikeness] = useState(false);
    const [consentResale, setConsentResale] = useState(false);
    const [swappingAsset, setSwappingAsset] = useState<string | null>(null);
    
    // Check for Founder status (or Architect override)
    const isFounder = currentUser?.role === 'FOUNDER' || isArchitect;

    useEffect(() => {
        if (embeddedFlixSynthOnly) {
            setActiveTab('flixsynth');
            setIsModalOpen(true);
        }
    }, [embeddedFlixSynthOnly]);

    const generateRAPG = async () => {
        setPrompt('Pinging Neural Core for stylistic vision...');
        setStatusMsg('INITIALIZING RAPG LLM SYNTHESIS...');
        
        try {
            const res = await fetch('/api/rapg', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ style: "Extremely detailed, distinct from generic sci-fi." })
            });

            if (!res.ok) throw new Error("API Failure");

            const data = await res.json();
            setPrompt(data.prompt);
            setStatusMsg('READY_FOR_COMMAND');
        } catch (error) {
            setPrompt('R.A.P.G OFFLINE. Utilizing backup sequence: A lone wanderer traversing a hyper-realistic neon desert at dusk, shot on 35mm film, volumetric lighting, highly detailed masterpiece.');
            setStatusMsg('READY_FOR_COMMAND');
        }
    };

    const handleFaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setFaceImage(file);
            setFacePreview(URL.createObjectURL(file));
        }
    };

    const runGeneration = async () => {
        if (!currentUser) return;
        
        const costMap: Record<string, number> = {
            flixsynth: 2,
            deforum: 5,
            vocal_dna: 10,
            neural_swap: 8
        };
        const actualCost = activeTab === 'flixsynth' ? costMap.flixsynth * batchSize : costMap[activeTab];
        const hasFreeGenerations = (currentUser.freeGenerationsRemaining || 0) > 0;

        if (!hasFreeGenerations && (currentUser.coinsBalance || 0) < actualCost) {
            setNeuralState('ERROR');
            setStatusMsg(`INSUFFICIENT TREASURY FUNDS. REQUIRE ${actualCost} COINS FOR NEURAL SYNTHESIS.`);
            return;
        }

        setNeuralState('PROCESSING');
        setStatusMsg(hasFreeGenerations ? `UTILIZING FOUNDER STIPEND [${currentUser.freeGenerationsRemaining} LEFT]...` : 'INITIATING GPU PIPELINE...');

        try {
            if (activeTab === 'neural_swap') {
                // RVC SWAP LOGIC
                setStatusMsg('EXTRACTING ACAPELLA STEM VIA DEMUCS...');
                await new Promise(r => setTimeout(r, 2000));
                setStatusMsg('MAPPING NEURAL BLUEPRINT timbres (RVC V2)...');
                await new Promise(r => setTimeout(r, 2500));
                setStatusMsg('FINALIZING ACOUSTIC CLONE...');
                await new Promise(r => setTimeout(r, 1000));
                
                setNeuralState('SUCCESS');
                setStatusMsg('SWAP COMPLETE. YOUR ACAPELLA REPLICA IS READY.');
                setLastOutput('https://storage.googleapis.com/suno-generated/acapella-swapped.wav');

                // XP Bonus for Neural Swap
                try {
                    const userDoc = doc(db, 'users', currentUser.uid);
                    await updateDoc(userDoc, { xp: increment(100) });
                    setUser({ xp: (currentUser.xp || 0) + 100 });
                } catch (e) { console.error("XP Sync Failure", e); }
            } else {
                const endpoint = activeTab === 'deforum' ? '/api/ai/deforum' : '/api/studio/generate';
                let body: any = { prompt };
                
                if (activeTab === 'flixsynth') {
                    body.batchSize = batchSize;
                }
                if (activeTab === 'flixsynth' && faceImage) {
                    const faceUrl = await uploadFaceToStorage();
                    body.faceUrl = faceUrl;
                }

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Neural Gateway Timeout - Matrix Unresponsive');
                }
                const data = await response.json();
                
                // User Cost Deduction & XP Bonus
                try {
                    const userDoc = doc(db, 'users', currentUser.uid);
                    const xpReward = activeTab === 'flixsynth' ? 50 : 100;

                    if (hasFreeGenerations) {
                        await updateDoc(userDoc, { 
                            freeGenerationsRemaining: increment(-1),
                            xp: increment(xpReward)
                        });
                        setUser({ 
                            freeGenerationsRemaining: (currentUser.freeGenerationsRemaining || 1) - 1,
                            xp: (currentUser.xp || 0) + xpReward
                        });
                    } else {
                        await updateDoc(userDoc, { 
                            coinsBalance: increment(-actualCost),
                            xp: increment(xpReward)
                        });
                        setUser({ 
                            coinsBalance: (currentUser.coinsBalance || actualCost) - actualCost,
                            xp: (currentUser.xp || 0) + xpReward
                        });
                    }
                } catch (e: any) {
                    throw new Error(`[USER_UPDATE_ERR] ${e.message}`);
                }

                if (activeTab === 'flixsynth') {
                    const receivedUrls = data.urls || [data.url];
                    if (!receivedUrls || receivedUrls.length === 0 || !receivedUrls[0]) {
                        throw new Error('Neural Foundry returned an empty visual payload.');
                    }
                    
                    setBatchUrls(receivedUrls);
                    setCurrentBatchIndex(0);
                    setIsBatchMode(true);
                    setNeuralState('SUCCESS');
                    setStatusMsg('BATCH LOADED. SWIPE REVIEW INITIATED.');
                } else {
                    const outputUrl = data.url;
                    if (!outputUrl) {
                        throw new Error('Neural Foundry returned an empty payload.');
                    }

                    setStatusMsg('ARCHIVING PAYLOAD TO SECURE CLOUD...');
                    let finalAssetUrl = outputUrl;
                    try {
                        finalAssetUrl = await archiveToPermanentStorage(outputUrl);
                    } catch (e: any) {
                        throw new Error(`[STORAGE_ERR] ${e.message}`);
                    }

                    try {
                        await addDoc(collection(db, 'user_assets', currentUser.uid, 'ai_generations'), {
                            type: activeTab,
                            prompt,
                            assetUrl: finalAssetUrl,
                            createdAt: serverTimestamp()
                        });
                    } catch (e: any) {
                        throw new Error(`[ASSET_DB_ERR] ${e.message}`);
                    }

                    setLastOutput(finalAssetUrl);
                    setNeuralState('SUCCESS');
                    setStatusMsg('SENSORY PAYLOAD BUFFERED. VIEW IN PRIVATE MATRIX.');
                }
            }

        } catch (error: any) {
            console.error(error);
            setNeuralState('ERROR');
            setStatusMsg(error.message || 'CRITICAL SYSTEM OVERLOAD.');
        }
    };

    const uploadToDrive = async (blob: Blob, fileName: string, mimeType: string) => {
        const formData = new FormData();
        formData.append('file', blob);
        formData.append('fileName', fileName);
        formData.append('mimeType', mimeType);

        const res = await fetch('/api/storage/drive', {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to sync to 30TB Google Drive Matrix');
        }

        const data = await res.json();
        return data.url;
    };

    const uploadFaceToStorage = async () => {
        if (!faceImage || !currentUser) return null;
        return await uploadToDrive(faceImage, `tmp-faces/${currentUser.uid}/${Date.now()}_face.jpg`, 'image/jpeg');
    };

    const archiveToPermanentStorage = async (url: string) => {
        if (!currentUser) return url;
        const res = await fetch(url);
        const blob = await res.blob();
        
        // Ensure proper mime mapping
        const isVideo = activeTab === 'deforum';
        const isAudio = activeTab === 'vocal_dna' || activeTab === 'neural_swap';
        const isWebP = url.startsWith('data:image/webp') || url.endsWith('.webp');
        
        const mimeType = isAudio ? 'audio/wav' : isVideo ? 'video/mp4' : isWebP ? 'image/webp' : 'image/jpeg';
        const ext = isAudio ? 'wav' : isVideo ? 'mp4' : isWebP ? 'webp' : 'jpg';

        return await uploadToDrive(blob, `user_assets/${currentUser.uid}/ai/${Date.now()}_gen.${ext}`, mimeType);
    };

    const handleStemUpload = async () => {
        if (!vocalStem || !currentUser) return;
        setNeuralState('PROCESSING');
        setStatusMsg('INITIATING BIOMETRIC ACOUSTIC INGESTION...');
        
        try {
            const downloadUrl = await uploadToDrive(vocalStem, `user_assets/${currentUser.uid}/dna/${Date.now()}_${vocalStem.name}`, vocalStem.type || 'audio/wav');
            
            await addDoc(collection(db, 'user_assets', currentUser.uid, 'vocal_dna'), {
                type: 'dry_stem',
                assetUrl: downloadUrl,
                fileName: vocalStem.name,
                createdAt: serverTimestamp()
            });

            const userDoc = doc(db, 'users', currentUser.uid);
            await updateDoc(userDoc, { 
                coinsBalance: increment(-10),
                xp: increment(100)
            });
            setUser({ 
                coinsBalance: (currentUser.coinsBalance || 0) - 10,
                xp: (currentUser.xp || 0) + 100
            });

            setNeuralState('SUCCESS');
            setStatusMsg('VOCAL DNA SEQUENCED. ASSET SECURED IN PRIVATE MATRIX.');
            setLastOutput(downloadUrl);
        } catch (err) {
            setNeuralState('ERROR');
            setStatusMsg('ACOUSTIC STREAM INTERRUPTED.');
        }
    };

    const handleSwipe = (e: any, info: PanInfo) => {
        const threshold = 100;
        if (info.offset.x > threshold) {
            // Swipe Right to Keep (Async fire and forget)
            const urlToArchive = batchUrls[currentBatchIndex];
            const uidStr = currentUser?.uid;
            const currentPrompt = prompt;

            // Don't block the UI thread waiting for 30TB cloud upload
            archiveToPermanentStorage(urlToArchive).then(async (finalUrl) => {
                if (uidStr) {
                    await addDoc(collection(db, 'user_assets', uidStr, 'ai_generations'), {
                        type: 'flixsynth',
                        prompt: currentPrompt,
                        assetUrl: finalUrl,
                        createdAt: serverTimestamp()
                    });
                }
            }).catch(err => {
                console.error("Background archive failed:", err);
            });
            
            setStatusMsg(`ASSET SAVED [${currentBatchIndex + 1}/${batchUrls.length}].`);
            advanceBatch();
        } else if (info.offset.x < -threshold) {
            // Swipe Left to Discard
            setStatusMsg(`ASSET DISCARDED [${currentBatchIndex + 1}/${batchUrls.length}].`);
            advanceBatch();
        }
    };

    const advanceBatch = () => {
        if (currentBatchIndex < batchUrls.length - 1) {
            setCurrentBatchIndex(prev => prev + 1);
        } else {
            setIsBatchMode(false);
            setBatchUrls([]);
            setStatusMsg('BATCH REVIEW COMPLETE.');
        }
    };
    
    // Reverse the slice so the current index is visually on top of the DOM stack
    const remainingUrls = batchUrls.slice(currentBatchIndex);
    const stackUrls = [...remainingUrls].reverse();

    
    // If embedded, we do not want the black absolute background taking over the whole page behind the modal
    return (
        <div className={embeddedFlixSynthOnly ? "" : "flex flex-col items-center justify-start min-h-screen pb-32 relative bg-black p-0 overflow-x-hidden"}>
            {!embeddedFlixSynthOnly && (
                <>

            {/* CINEMATIC B-ROLL BACKGROUND LAYER */}
            <div className="fixed inset-0 z-[-1] flex items-center justify-center pointer-events-none overflow-hidden">
                <video 
                    src={`/api/neural-assets?node=NEURAL&pilot=system`}
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover opacity-20 mix-blend-screen scale-110 blur-md"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-black z-10" />
            </div>

            

            <div className="relative z-40 w-full max-w-[1400px] mx-auto px-4 md:px-8 pt-3 md:pt-6 flex flex-col items-center">

                <div className="w-full mb-4 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-solid border-primary/20 pb-2 md:pb-4 gap-4 md:gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex items-start gap-3 md:gap-4">
                        <div className="p-3 md:p-4 bg-primary/10 border border-primary/20 rounded-full shadow-[0_0_20px_rgba(var(--color-primary),0.2)]">
                            <Sparkles className="w-5 h-5 md:w-8 md:h-8 text-primary cyber-flicker-slow" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-7xl font-black font-bebas text-white tracking-widest uppercase mb-0 md:mb-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">NEURAL FOUNDRY</h1>
                            <p className="font-mono text-[8px] sm:text-[11px] text-primary/70 uppercase tracking-[0.3em] md:tracking-[0.5em] font-bold italic">[ SYNTHESIZING ORIGINAL MISSION ASSETS ]</p>
                        </div>
                    </div>
                    <div className="w-full md:w-auto flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl border-2 sm:border-4 border-primary/30 rounded-xl md:rounded-2xl py-3 px-6 md:p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] text-center">
                        <div className="flex items-center justify-center gap-2 md:gap-3 text-white">
                            <Coins size={14} className="text-yellow-500 md:w-5 md:h-5 shrink-0" />
                            <span className="font-bebas text-2xl md:text-4xl tracking-widest leading-none">{currentUser?.coinsBalance?.toLocaleString() || '0'} C</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 w-full mb-10 md:mb-20">
                    {(['flixsynth', 'deforum', 'vocal_dna', 'neural_swap'] as const).map(tab => (
                        <div 
                            key={tab}
                            className="group relative bg-black/60 backdrop-blur-3xl border border-primary/20 rounded-xl md:rounded-2xl hover:border-primary/60 hover:shadow-[0_0_50px_rgba(var(--color-primary),0.15)] transition-all duration-700 overflow-hidden"
                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)' }}
                        >
                            {/* Diagnostic Background Element */}
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                            <div className="absolute -right-4 -top-4 w-12 h-12 md:w-24 md:h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-1000" />
                            
                            <div className="p-3 md:p-8 flex flex-col items-center text-center gap-2 md:gap-6 relative z-10 w-full h-full justify-between">
                                <div className={`p-2 bg-black/80 border border-primary/10 rounded-xl group-hover:border-primary/60 group-hover:scale-110 transition-all duration-500 shadow-[inset_0_0_20px_rgba(var(--color-primary),0.1)]`}>
                                    {tab === 'flixsynth' && <ImageIcon size={20} className="text-primary md:w-8 md:h-8" />}
                                    {tab === 'deforum' && <Video size={20} className="text-primary md:w-8 md:h-8" />}
                                    {tab === 'vocal_dna' && <Terminal size={20} className="text-primary md:w-8 md:h-8" />}
                                    {tab === 'neural_swap' && <Database size={20} className="text-primary md:w-8 md:h-8" />}
                                </div>
                                <div className="flex flex-col justify-center items-center">
                                    <h3 className="text-sm md:text-2xl font-black font-bebas text-white tracking-[0.2em] mb-0 md:mb-2 uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] group-hover:text-primary transition-colors leading-tight">
                                        {tab === 'flixsynth' ? 'FLIXSYNTH' : tab === 'deforum' ? 'DEFORUM' : tab === 'vocal_dna' ? 'VOCAL DNA' : 'NEURAL SWAP'}
                                    </h3>
                                    <p className="hidden md:block text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em] font-bold leading-relaxed group-hover:text-gray-300 transition-colors px-2">
                                        {tab === 'flixsynth' ? 'Forge original album covers and visual identities' : 
                                         tab === 'deforum' ? 'Cinematic music video sequencing for original works' :
                                         tab === 'vocal_dna' ? 'Clone and Practice your identity for Original Works' :
                                         'Replace Suno voices with your Neural Blueprint'}
                                    </p>
                                </div>
                                {(!isFounder && tab !== 'flixsynth') ? (
                                    <button 
                                        disabled
                                        className="w-full px-1 py-3 md:px-8 md:py-4 bg-red-500/10 text-red-500/50 border border-red-500/20 rounded-lg md:rounded-xl font-mono text-[7px] md:text-[10px] font-black uppercase tracking-widest md:tracking-[0.4em] mt-1 md:mt-4 whitespace-nowrap cursor-not-allowed"
                                    >
                                        [ COMING SOON ]
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => { setActiveTab(tab); setIsModalOpen(true); setNeuralState('IDLE'); setLastOutput(null); setIsBatchMode(false); }}
                                        className="w-full px-1 py-3 md:px-8 md:py-4 bg-black/40 text-primary border border-primary/30 rounded-lg md:rounded-xl font-mono text-[7px] md:text-[10px] font-black uppercase tracking-widest md:tracking-[0.4em] hover:bg-primary hover:text-black transition-all shadow-xl group-hover:border-primary/80 mt-1 md:mt-4 whitespace-nowrap"
                                    >
                                        [ BOOT ]
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            </>
            )}

            {isModalOpen && (
                <div className="w-full max-w-[1700px] mx-auto px-4 md:px-8 animate-in slide-in-from-bottom-8 duration-700 pb-32">
                    
                    {/* INLINE TOOL HEADER */}
                    <div className="flex items-center justify-between p-4 md:p-6 border border-primary/20 bg-black/80 backdrop-blur-md rounded-t-3xl relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary animate-pulse" />
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-4">
                                <Cpu size={24} className="text-primary animate-pulse hidden sm:block" />
                                <h2 className="text-3xl sm:text-5xl font-black font-bebas text-white tracking-[0.1em] uppercase italic leading-none drop-shadow-[0_2px_15px_rgba(var(--color-primary),0.4)]">
                                    {activeTab === 'flixsynth' ? 'FLIXSYNTH ART STUDIO' : activeTab === 'deforum' ? 'VIDEO ENGINE' : activeTab === 'vocal_dna' ? 'NEURAL BLUEPRINT' : 'NEURAL SWAP CONVERSION'}
                                </h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[9px] font-mono text-primary/40 uppercase tracking-[0.5em] font-black">Neural_Link_OK</span>
                                <div className="w-1 h-1 rounded-full bg-green-500 animate-ping" />
                            </div>
                        </div>

                        <button 
                            onClick={() => {
                                setIsModalOpen(false);
                                if (onEmbeddedClose) onEmbeddedClose();
                            }}
                            className="px-6 py-4 bg-black border-2 border-primary/30 text-primary hover:bg-primary hover:text-black hover:scale-105 transition-all shadow-[0_0_15px_rgba(var(--color-primary),0.2)] font-bebas text-xl tracking-widest hidden sm:block"
                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)' }}
                        >
                            <X size={20} className="inline mr-2" /> DISCONNECT
                        </button>
                        <button 
                            onClick={() => {
                                setIsModalOpen(false);
                                if (onEmbeddedClose) onEmbeddedClose();
                            }}
                            className="p-3 bg-black border-2 border-primary/30 text-primary hover:bg-primary hover:text-black transition-all sm:hidden"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* TOOL BODY OVERRIDE */}
                    <div className="bg-black/60 border-x border-b border-primary/20 rounded-b-3xl p-4 sm:p-8 backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.9)] relative flex-1">
                        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(var(--color-primary),0.02)_0,transparent_100%)] opacity-30" />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-16">
                    
                    {/* LEFT CONTROLS PORT - ALWAYS VISIBLE AT OP */}
                    <div className="lg:col-span-6 2xl:col-span-5 flex flex-col gap-6 sm:gap-8 order-1 lg:order-1">
                        <div className="flex flex-col gap-5">
                            <label className="text-[11px] font-mono text-primary uppercase tracking-[0.2em] flex justify-between font-black items-center">
                                <span className="flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-primary/40 rounded-full" />
                                    {activeTab === 'neural_swap' ? 'TARGET PAYLOAD URL' : 'NEURAL PROMPT PAYLOAD'}
                                </span>
                                <span className="text-yellow-500 tracking-widest bg-yellow-500/10 px-3 py-1 border border-yellow-500/30 font-black text-[9px] drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">
                                    [ {activeTab === 'deforum' ? '5' : activeTab === 'vocal_dna' ? '10' : activeTab === 'neural_swap' ? '8' : '2'} COINS ]
                                </span>
                            </label>

                            {/* RAPG Visual Masterpiece Slot Engine */}
                            {activeTab === 'flixsynth' && (
                                <div className="mb-8 mt-2">
                                    <RAPGSlotMachine prompt={prompt} setPrompt={setPrompt} />
                                </div>
                            )}

                            <textarea 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={activeTab === 'deforum' ? "Describe the music video sequence..." : 
                                             activeTab === 'neural_swap' ? "Paste Suno link or Archive Path..." : "Describe the visual vision..."}
                                className="w-full min-h-[140px] sm:min-h-[180px] bg-black/80 border-2 border-primary/20 p-5 sm:p-8 font-mono text-white text-[12px] sm:text-sm focus:outline-none focus:border-primary/60 transition-all custom-scrollbar placeholder:text-primary/10 shadow-[inset_0_0_30px_rgba(var(--color-primary),0.02)]"
                                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)' }}
                            />
                            {(activeTab === 'flixsynth' || activeTab === 'deforum') && (
                                <div className="flex w-full justify-between items-center gap-4">
                                    {activeTab === 'flixsynth' && (
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-[9px] text-primary/60 uppercase tracking-[0.2em] font-black whitespace-nowrap">Batch Size: </span>
                                            <div className="flex border border-primary/20 rounded-lg overflow-hidden shrink-0">
                                                {[1, 2, 4].map(num => (
                                                    <button
                                                        key={num}
                                                        onClick={() => setBatchSize(num)}
                                                        className={`px-3 py-1.5 font-mono text-[10px] sm:text-xs font-black transition-all ${batchSize === num ? 'bg-[rgb(var(--color-primary))] text-black' : 'bg-black text-primary/60 hover:text-primary hover:bg-primary/10'}`}
                                                    >
                                                        {num}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === 'deforum' && (
                                        <button 
                                            onClick={generateRAPG}
                                            className="flex items-center gap-2 sm:gap-3 bg-black/60 hover:bg-primary/10 border border-primary/30 px-3 sm:px-6 py-2 sm:py-4 rounded-xl font-mono text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-[0.2em] sm:tracking-[0.3em] transition-all hover:border-primary/60 shadow-xl ml-auto"
                                        >
                                            <Sparkles size={16} className="animate-pulse" /> [ RANDOMIZE ]
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ELEVATED NEURAL SYNTHESIS ACTION (moved from bottom) */}
                        <div className="relative group/btn my-4 z-20">
                            <div className="absolute -inset-2 bg-primary/40 blur-2xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-1000" />
                            <CyberButton 
                                text={neuralState === 'PROCESSING' ? 'SYNTHESIZING...' : 
                                      activeTab === 'vocal_dna' ? 'TRANSMIT DNA PAYLOAD' : 
                                      activeTab === 'neural_swap' ? 'INITIATE NEURAL SWAP' : 'INITIATE NEURAL SYNTHESIS'}
                                disabled={neuralState === 'PROCESSING' || 
                                         (activeTab === 'vocal_dna' ? (!vocalStem || !consentLikeness || !consentResale) : !prompt)} 
                                onClick={activeTab === 'vocal_dna' ? handleStemUpload : runGeneration}
                                className="w-full h-20 text-2xl md:text-4xl tracking-[0.2em] font-black relative z-10 drop-shadow-[0_0_20px_rgba(var(--color-primary),0.5)] border-primary/50 bg-black/60 backdrop-blur-md"
                                style={{ clipPath: 'polygon(0 15px, 15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)' }}
                            />
                        </div>

                        {activeTab === 'flixsynth' && (
                            <FlixSynthPanel facePreview={facePreview} handleFaceChange={handleFaceChange} />
                        )}

                        {activeTab === 'vocal_dna' && (
                            <VocalDnaPanel 
                                consentLikeness={consentLikeness} setConsentLikeness={setConsentLikeness}
                                consentResale={consentResale} setConsentResale={setConsentResale}
                                vocalStemName={vocalStemName} setVocalStem={setVocalStem} setVocalStemName={setVocalStemName}
                            />
                        )}

                        {activeTab === 'neural_swap' && (
                            <NeuralSwapPanel />
                        )}


                    </div>

                    {/* RIGHT PREVIEW PORT - UNDER CONTROLS ON MOBILE NOW */}
                    <div className="lg:col-span-7 order-2 lg:order-2">
                        <div className="lg:sticky lg:top-0 flex flex-col gap-8">
                            
                            {/* Mission Status HUD */}
                            <div className={`p-8 border-2 ${neuralState === 'ERROR' ? 'border-red-500/40 bg-red-500/10' : 'border-primary/20 bg-primary/5'} flex items-center justify-between rounded-3xl animate-in slide-in-from-right-4 duration-500 shadow-2xl overflow-hidden relative`}>
                                <div className="absolute left-0 top-0 w-1 h-full bg-primary animate-pulse" />
                                <div className="flex items-center gap-6 relative z-10">
                                    <div className={`p-4 rounded-xl ${neuralState === 'ERROR' ? 'bg-red-500/20' : 'bg-black/60'} border border-primary/20 shadow-[0_0_20px_rgba(0,0,0,0.4)]`}>
                                        {neuralState === 'PROCESSING' ? (
                                            <Loader2 className="animate-spin text-primary" size={32} />
                                        ) : neuralState === 'ERROR' ? (
                                            <AlertCircle className="text-red-500 h-8 w-8" />
                                        ) : neuralState === 'SUCCESS' ? (
                                            <CheckCircle2 className="text-primary h-8 w-8" />
                                        ) : <Terminal className="text-primary h-8 w-8 opacity-40 hover:opacity-100 transition-opacity" />}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-mono text-primary/40 uppercase tracking-[0.5em] font-black">Protocol_Status</span>
                                        <span className={`font-mono text-sm md:text-xl uppercase tracking-[0.1em] font-black italic drop-shadow-[0_0_10px_rgba(var(--color-primary),0.5)] ${neuralState === 'ERROR' ? 'text-red-500' : 'text-primary'}`}>
                                            {neuralState === 'IDLE' ? 'READY_FOR_COMMAND' : statusMsg}
                                        </span>
                                    </div>
                                </div>
                                {neuralState === 'PROCESSING' && (
                                    <div className="flex flex-col items-end gap-1 font-mono text-[8px] text-primary/30 uppercase tracking-widest hidden sm:flex">
                                        <span className="animate-pulse">SYNTHESIZING...</span>
                                        <div className="w-20 h-1 bg-primary/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary animate-progress" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* MAIN ASSET PREVIEW CONSOLE - 9:16 ARCHITECTURE */}
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-0" />
                                <div className="relative bg-[#020202] border border-primary/20 aspect-[9/16] md:max-h-[700px] flex items-center justify-center shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden" 
                                     style={{ 
                                        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%)',
                                        filter: 'drop-shadow(0 0 40px rgba(0,0,0,1))'
                                     }}>
                                    
                                    {/* Scanline & Atmosphere grid */}
                                    <div className="absolute inset-0 pointer-events-none opacity-20 scanlines opacity-10 z-20" />
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--color-primary),0.02)_0,transparent_100%)] opacity-30 z-10" />

                                    {isBatchMode && batchUrls.length > 0 ? (
                                        <div className="w-full h-full flex flex-col items-center justify-between py-8 px-4 bg-black/90 z-40 relative animate-in fade-in duration-500">
                                            <div className="text-center w-full relative z-50">
                                                <h2 className="text-xl sm:text-2xl font-bebas tracking-widest text-[#00ffff] mb-1 uppercase">Batch Complete</h2>
                                                <div className="font-mono text-[9px] text-[#00ffff]/50 tracking-[0.3em] bg-[#00ffff]/10 inline-block px-3 py-1 border border-[#00ffff]/20">
                                                    [{currentBatchIndex + 1} / {batchUrls.length}]
                                                </div>
                                            </div>
                                            
                                            <div className="relative w-full aspect-square sm:max-w-[300px] flex items-center justify-center my-4 overflow-visible z-40">
                                                <AnimatePresence>
                                                    {stackUrls.map((url, stackIndex) => {
                                                        const isTop = stackIndex === stackUrls.length - 1;
                                                        const virtualIndex = stackUrls.length - 1 - stackIndex;
                                                        return (
                                                            <BatchCard 
                                                                key={`${currentBatchIndex + virtualIndex}-${url}`} 
                                                                url={url} 
                                                                isTop={isTop} 
                                                                index={virtualIndex}
                                                                handleSwipe={handleSwipe}
                                                            />
                                                        );
                                                    })}
                                                </AnimatePresence>
                                            </div>

                                            {batchUrls.length > 0 && currentBatchIndex >= batchUrls.length ? (
                                                <div className="w-full z-50 relative pb-6 px-4">
                                                    <CyberButton text="VIEW ARCHIVES" onClick={() => window.location.href = '/pod'} className="w-full h-14 text-lg" />
                                                </div>
                                            ) : (
                                                <div className="flex w-full justify-between items-center px-6 gap-4 z-50 relative pb-6">
                                                    <button onClick={() => handleSwipe(null, { offset: { x: -200 } } as any)} className="w-16 h-16 flex items-center justify-center rounded-full border-2 border-red-500/30 bg-red-500/10 hover:bg-red-500/30 text-red-500 transition-all shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                                                        <Trash2 size={24} />
                                                    </button>
                                                    <button onClick={() => handleSwipe(null, { offset: { x: 200 } } as any)} className="w-16 h-16 flex items-center justify-center rounded-full border-2 border-green-500/30 bg-green-500/10 hover:bg-green-500/30 text-green-500 transition-all shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                                                        <Save size={24} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : lastOutput ? (
                                        <div className="w-full h-full animate-in zoom-in-95 duration-1000 relative">
                                            {activeTab === 'deforum' ? (
                                                <video src={lastOutput} controls autoPlay loop className="w-full h-full object-cover" />
                                            ) : (activeTab === 'neural_swap' || activeTab === 'vocal_dna') ? (
                                                <div className="flex flex-col items-center justify-center gap-8 py-24 w-full h-full bg-black/40">
                                                    <div className="relative">
                                                        <div className="absolute -inset-8 bg-primary/10 blur-3xl rounded-full animate-pulse" />
                                                        <div className="p-8 bg-black/80 border border-primary/30 rounded-full relative z-10 shadow-[0_0_40px_rgba(var(--color-primary),0.3)]">
                                                            <Zap className="text-primary w-12 h-12 animate-pulse" />
                                                        </div>
                                                    </div>
                                                    <div className="w-full max-w-[80%]">
                                                        <audio src={lastOutput} controls className="w-full h-10 accent-primary drop-shadow-[0_0_10px_rgba(var(--color-primary),0.2)]" />
                                                    </div>
                                                    <span className="font-mono text-[9px] text-primary/40 uppercase tracking-[0.4em] font-black cyber-flicker-slow italic">Neural_Bitstream_Live</span>
                                                </div>
                                            ) : (
                                                <img src={lastOutput} className="w-full h-full object-cover hover:scale-[1.05] transition-transform duration-[3s] cursor-zoom-in" />
                                            )}
                                            
                                            {/* Tactical HUD Overlay for Generated Image */}
                                            <div className="absolute inset-x-6 bottom-6 flex justify-between items-end pointer-events-none z-30">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[7px] font-mono text-white/40 uppercase tracking-widest">Node_Archive_001</span>
                                                    <span className="text-[10px] font-mono text-primary uppercase font-bold tracking-[0.2em]">{Date.now().toString().slice(-4)}_SYNTH</span>
                                                </div>
                                                <div className="w-10 h-[1px] bg-primary/40" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center w-full h-full border border-dashed border-[#00ffff]/20 bg-[#00ffff]/5">
                                            <span className="font-mono text-[10px] uppercase tracking-[0.5em] cyber-flicker-slow text-[#00ffff]/50">Awaiting Subroutine</span>
                                        </div>
                                    )}

                                    {/* Corners / HUD details */}
                                    <div className="absolute top-4 left-4 w-2 h-2 border-t border-l border-primary/40" />
                                    <div className="absolute top-4 right-4 w-2 h-2 border-t border-r border-primary/40" />
                                    <div className="absolute bottom-10 left-4 w-2 h-2 border-b border-l border-primary/40" />
                                </div>

                                {lastOutput && (
                                    <div className="mt-8 flex flex-col sm:flex-row gap-6 animate-in slide-in-from-bottom-4 duration-700 delay-500">
                                        <div className="flex-1 flex gap-4">
                                            {activeTab === 'vocal_dna' && (
                                                <button className="flex-1 py-5 bg-white text-black font-mono text-[11px] uppercase tracking-widest hover:bg-primary transition-all font-black border-2 border-white/20 shadow-2xl">DOWNLOAD_DNA_CHAIN</button>
                                            )}
                                            <button 
                                                onClick={() => window.open(lastOutput, '_blank')} 
                                                className="flex-1 py-5 bg-primary text-black font-mono text-[11px] uppercase tracking-widest hover:bg-white transition-all font-black border-2 border-primary/40 shadow-[0_0_30px_rgba(var(--color-primary),0.3)] animate-pulse hover:animate-none"
                                            >
                                                SYNC_TO_LOCAL_DRIVE
                                            </button>
                                        </div>
                                        <div className="flex flex-col justify-center items-end hidden md:flex">
                                            <span className="text-[10px] font-mono text-primary/40 uppercase tracking-[0.3em] font-black">Archive_Index</span>
                                            <span className="text-[12px] font-mono text-white tracking-widest">#{Date.now().toString().slice(-6)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                    </div>
                </div>
            </div>
                    </div>
                </div>
            )}



            <div className="fixed inset-0 pointer-events-none z-[100] opacity-10 mix-blend-overlay scanlines" />
        </div>
    );
}

function BatchCard({ url, isTop, index, handleSwipe }: { url: string, isTop: boolean, index: number, handleSwipe: any }) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-15, 15]);

    const likeOpacity = useTransform(x, [50, 150], [0, 1]);
    const dislikeOpacity = useTransform(x, [-50, -150], [0, 1]);

    let scale = 1.0;
    let yOffset = 0;
    if (!isTop) {
        if (index === 1) {
            scale = 0.95;
            yOffset = -15;
        } else if (index === 2) {
            scale = 0.9;
            yOffset = -30;
        } else {
            scale = 0.85;
            yOffset = -45;
        }
    }

    return (
        <motion.div
            className={`absolute inset-0 m-auto w-full max-w-full h-full rounded-[2rem] overflow-hidden border-2 border-[#00ffff]/30 shadow-[0_0_80px_rgba(0,255,255,0.1)] bg-[#020202] ${isTop ? 'z-40' : 'z-10'}`}
            style={{ x, rotate }}
            animate={{ scale, y: yOffset }}
            exit={{ opacity: 0, scale: 0.85, y: yOffset + 100, transition: { duration: 0.5, ease: 'easeOut' } }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            drag={isTop ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={(e, info) => handleSwipe(e, info)}
            whileDrag={{ scale: 1.05, cursor: "grabbing" }}
        >
            <img src={url} className="w-full h-full object-cover pointer-events-none" />

            {isTop && (
                <>
                    <motion.div 
                        className="absolute top-12 left-6 z-50 border-[4px] border-green-500 rounded-lg px-4 py-1 text-green-500 font-bebas text-4xl tracking-widest uppercase rotate-[-15deg] bg-black/40 backdrop-blur-sm pointer-events-none"
                        style={{ opacity: likeOpacity }}
                    >
                        ARCHIVE
                    </motion.div>
                    <motion.div 
                        className="absolute top-12 right-6 z-50 border-[4px] border-red-500 rounded-lg px-4 py-1 text-red-500 font-bebas text-4xl tracking-widest uppercase rotate-[15deg] bg-black/40 backdrop-blur-sm pointer-events-none"
                        style={{ opacity: dislikeOpacity }}
                    >
                        DISCARD
                    </motion.div>
                </>
            )}
        </motion.div>
    );
}
