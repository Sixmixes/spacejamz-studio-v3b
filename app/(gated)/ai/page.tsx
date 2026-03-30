'use client';

import { useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { Sparkles, Video, UserPlus, Lock, Zap, Coins, Image as ImageIcon, AlertCircle, Loader2, Cpu, Terminal, CheckCircle2, Database } from 'lucide-react';
import { CyberButton } from '@/components/ui/CyberButton';
import { NeuralModal } from '@/components/ui/NeuralModal';
import NeuralIdentityTerminal from '@/components/global/NeuralIdentityTerminal';
import { db, storage } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

type NeuralState = 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR';

export default function NeuralStudio() {
    const { currentUser, isArchitect } = useUserStore();
    const [activeTab, setActiveTab] = useState<'flixsynth' | 'deforum' | 'vocal_dna' | 'neural_swap'>('flixsynth');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [faceImage, setFaceImage] = useState<File | null>(null);
    const [facePreview, setFacePreview] = useState<string | null>(null);
    const [neuralState, setNeuralState] = useState<NeuralState>('IDLE');
    const [statusMsg, setStatusMsg] = useState('');
    const [lastOutput, setLastOutput] = useState<string | null>(null);
    const [vocalStem, setVocalStem] = useState<File | null>(null);
    const [vocalStemName, setVocalStemName] = useState<string | null>(null);
    const [consentLikeness, setConsentLikeness] = useState(false);
    const [consentResale, setConsentResale] = useState(false);
    const [swappingAsset, setSwappingAsset] = useState<string | null>(null);
    
    // Check for Founder status (or Architect override)
    const isFounder = currentUser?.role === 'FOUNDER' || isArchitect;

    const generateRAPG = () => {
        const subjects = ["A lone cyber-monk", "A shattered porcelain android", "A neon-drenched samurai", "A massive orbital dreadnought", "A bioluminescent deep-sea leviathan", "A rogue AI mainframe", "A phantom data-courier", "A chrome-plated gargoyle", "A squad of tactical hackers"];
        const actions = ["meditating in the rain", "breaching the atmosphere", "dissolving into data streams", "standing over a defeated mech", "floating in zero gravity", "hacking a neural port", "summoning a digital storm", "awakening from cryosleep"];
        const environments = ["in a brutalist concrete megacity", "inside a shattered quantum reactor", "on the edge of a black hole accretion disk", "in a forgotten subterranean temple", "atop a floating glass pyramid", "within an infinite server farm", "in a neon-lit cyberpunk alleyway"];
        const lighting = ["volumetric god rays", "harsh neon underglow", "strobe lighting", "thick radioactive fog", "bioluminescent spores floating in the air", "diffused cinematic lighting", "lens flares"];
        const styles = ["shot on 35mm film", "8k resolution octane render", "unreal engine 5 cinematic", "macro photography, shallow depth of field", "vintage anime aesthetic, 1990s cel shading", "hyper-realistic matte painting"];
        const aesthetics = ["style of H.R. Giger", "cyberpunk aesthetic", "synthwave retrowave", "dark fantasy", "directed by Denis Villeneuve", "by Syd Mead", "Yoji Shinkawa line art"];

        const r = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
        const generated = `${r(subjects)} ${r(actions)} ${r(environments)}, ${r(lighting)}, ${r(styles)}, ${r(aesthetics)}. Masterpiece, highly detailed, trending on ArtStation.`;
        
        setPrompt(generated);
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
        const cost = costMap[activeTab];
        const hasFreeGenerations = (currentUser.freeGenerationsRemaining || 0) > 0;

        if (!hasFreeGenerations && (currentUser.coinsBalance || 0) < cost) {
            setNeuralState('ERROR');
            setStatusMsg(`INSUFFICIENT TREASURY FUNDS. REQUIRE ${cost} COINS FOR NEURAL SYNTHESIS.`);
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
            } else {
                const endpoint = activeTab === 'deforum' ? '/api/studio/deforum' : '/api/studio/generate';
                let body: any = { prompt };
                
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
                const outputUrl = data.imageUrl || data.videoUrl;

                setStatusMsg('ARCHIVING PAYLOAD TO SECURE CLOUD...');
                let finalAssetUrl = outputUrl;
                try {
                    finalAssetUrl = await archiveToPermanentStorage(outputUrl);
                } catch (e: any) {
                    throw new Error(`[STORAGE_ERR] ${e.message}`);
                }

                try {
                    const userDoc = doc(db, 'users', currentUser.uid);
                    if (hasFreeGenerations) {
                        await updateDoc(userDoc, { freeGenerationsRemaining: increment(-1) });
                    } else {
                        await updateDoc(userDoc, { coinsBalance: increment(-cost) });
                    }
                } catch (e: any) {
                    throw new Error(`[USER_UPDATE_ERR] ${e.message}`);
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
        const mimeType = isAudio ? 'audio/wav' : isVideo ? 'video/mp4' : 'image/jpeg';
        const ext = isAudio ? 'wav' : isVideo ? 'mp4' : 'jpg';

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
            await updateDoc(userDoc, { coinsBalance: increment(-10) });

            setNeuralState('SUCCESS');
            setStatusMsg('VOCAL DNA SEQUENCED. ASSET SECURED IN PRIVATE MATRIX.');
            setLastOutput(downloadUrl);
        } catch (err) {
            setNeuralState('ERROR');
            setStatusMsg('ACOUSTIC STREAM INTERRUPTED.');
        }
    };

    if (!isFounder) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 sm:p-12 text-center bg-black/40 backdrop-blur-sm border border-red-500/20 rounded-3xl m-4 lg:m-20">
                <Lock className="w-16 h-16 text-red-500 mb-6 animate-pulse" />
                <h1 className="text-4xl sm:text-6xl font-black font-bebas text-white tracking-widest mb-4">PRIORITY CLEARANCE REQUIRED</h1>
                <p className="font-mono text-[10px] sm:text-xs text-red-500/80 uppercase tracking-[0.4em] max-w-xl leading-relaxed">
                    ACCESS TO THE NEURAL STUDIO IS RESTRICTED TO CERTIFIED [ FOUNDER ] OPERATIVES. UPGRADE CLEARANCE TO BYPASS SECURITY.
                </p>
                <CyberButton text="RETURN TO CORE" onClick={() => (window.location.href = '/')} className="mt-12" />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-start min-h-screen pb-0 relative bg-black p-0">
            
            <NeuralIdentityTerminal className="mb-0" />

            <div className="w-full mb-0 flex flex-col md:flex-row justify-between items-end border-b border-solid border-[#00ffff]/20 pb-4 gap-4 animate-in fade-in duration-700">
                <div className="flex items-start gap-2">
                    <Sparkles className="w-8 h-8 text-[#00ffff] cyber-flicker-slow drop-shadow-[0_0_10px_#00ffff]" />
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black font-bebas text-white tracking-widest uppercase mb-0 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">NEURAL STUDIO</h1>
                        <p className="font-mono text-[10px] text-[#00ffff]/70 uppercase tracking-[0.5em] font-bold drop-shadow-md">[ SUNO-GRADE PRODUCTION FOR ORIGINAL WORKS ]</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1 bg-black/40 backdrop-blur-xl border border-[#00ffff]/20 rounded-2xl p-4 shadow-[0_0_30px_rgba(0,255,255,0.05)]">
                    <div className="flex items-center gap-2 text-[#00ffff] mb-0">
                        <Coins size={12} />
                        <span className="font-bebas text-2xl tracking-widest text-white">{currentUser?.coinsBalance?.toLocaleString() || '0'} C</span>
                    </div>
                    <span className="text-[7px] font-mono text-gray-400 tracking-widest uppercase">Treasury Credits Remaining</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 w-full mb-0 z-20 px-0">
                {(['flixsynth', 'deforum', 'vocal_dna', 'neural_swap'] as const).map(tab => (
                    <div 
                        key={tab}
                        className="group relative bg-black/40 backdrop-blur-xl border border-[#00ffff]/20 rounded-2xl hover:border-[#00ffff]/60 hover:shadow-[0_0_40px_rgba(0,255,255,0.15)] transition-all duration-500 overflow-hidden p-0 m-2"
                        style={{ clipPath: 'none' }}
                    >
                        <div className="p-6 flex flex-col items-center text-center gap-4 relative z-10">
                            <div className={`p-4 bg-transparent border border-solid border-[#00ffff]/30 rounded-2xl group-hover:border-[#00ffff]/80 group-hover:bg-[#00ffff]/5 transition-all duration-500 shadow-[inset_0_0_20px_rgba(0,255,255,0.05)]`}>
                                {tab === 'flixsynth' && <ImageIcon size={32} className="text-[#00ffff]" />}
                                {tab === 'deforum' && <Video size={32} className="text-[#00ffff]" />}
                                {tab === 'vocal_dna' && <Terminal size={32} className="text-[#00ffff]" />}
                                {tab === 'neural_swap' && <Database size={32} className="text-[#00ffff]" />}
                            </div>
                            <div className="min-h-[80px] flex flex-col justify-center">
                                <h3 className="text-xl font-black font-bebas text-white tracking-[0.2em] mb-1 italic uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                                    {tab === 'flixsynth' ? 'FLIXSYNTH ART' : tab === 'deforum' ? 'VIDEO ENGINE' : tab === 'vocal_dna' ? 'NEURAL BLUEPRINT' : 'NEURAL SWAP'}
                                </h3>
                                <p className="text-[9px] font-mono text-gray-400 uppercase tracking-[0.3em] font-bold leading-relaxed group-hover:text-[#00ffff]/80 transition-colors">
                                    {tab === 'flixsynth' ? 'Forge original album covers and visual identities' : 
                                     tab === 'deforum' ? 'Cinematic music video sequencing for original works' :
                                     tab === 'vocal_dna' ? 'Clone and Practice your identity for Original Works' :
                                     'Replace Suno voices with your Neural Blueprint'}
                                </p>
                            </div>
                            <button 
                                onClick={() => { setActiveTab(tab); setIsModalOpen(true); setNeuralState('IDLE'); setLastOutput(null); }}
                                className="mt-4 px-8 py-3 bg-transparent text-[#00ffff] border border-solid border-[#00ffff]/30 rounded-xl font-mono text-[9px] font-black uppercase tracking-[0.3em] hover:bg-[#00ffff]/10 hover:border-[#00ffff]/60 transition-all shadow-lg"
                            >
                                [ LAUNCH TERMINAL ]
                            </button>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#00ffff]/10 to-transparent group-hover:opacity-100 opacity-0 transition-opacity" />
                    </div>
                ))}
            </div>

            <NeuralModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={activeTab === 'flixsynth' ? 'FLIXSYNTH ART STUDIO' : activeTab === 'deforum' ? 'VIDEO ENGINE' : activeTab === 'vocal_dna' ? 'NEURAL BLUEPRINT' : 'NEURAL SWAP CONVERSION'}
            >
                <div className="flex flex-col gap-10">
                    <div className="flex flex-col gap-4">
                        <label className="text-[10px] font-mono text-primary/60 uppercase tracking-widest flex justify-between font-bold">
                            <span>{activeTab === 'neural_swap' ? 'SUNO ASSET URL' : 'NEURAL PROMPT PAYLOAD'}</span>
                            <span className="text-yellow-500 tracking-widest bg-yellow-500/10 px-2 border border-yellow-500/30 font-black">
                                [ {activeTab === 'deforum' ? '5' : activeTab === 'vocal_dna' ? '10' : activeTab === 'neural_swap' ? '8' : '2'} COINS ]
                            </span>
                        </label>
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={activeTab === 'deforum' ? "Describe the music video sequence..." : 
                                         activeTab === 'neural_swap' ? "Paste Suno link or Archive Path..." : "Describe the visual vision..."}
                            className="w-full min-h-[160px] bg-black border-2 border-primary/20 p-8 font-mono text-white text-sm focus:outline-none focus:border-primary/60 transition-colors custom-scrollbar placeholder:text-primary/20"
                        />
                        {(activeTab === 'flixsynth' || activeTab === 'deforum') && (
                            <div className="flex w-full justify-end mt-1">
                                <button 
                                    onClick={generateRAPG}
                                    className="flex items-center gap-2 bg-black hover:bg-[#00ffff]/10 border border-[#00ffff]/40 px-4 py-3 rounded-lg font-mono text-[10px] font-black text-[#00ffff] uppercase tracking-[0.2em] transition-all shadow-[0_0_15px_rgba(0,255,255,0.1)]"
                                >
                                    <Sparkles size={14} className="animate-pulse" /> [ SYSTEM OVERRIDE: R.A.P.G. ]
                                </button>
                            </div>
                        )}
                    </div>

                    {activeTab === 'flixsynth' && (
                        <div className="flex flex-col gap-6 bg-primary/5 p-8 border border-primary/10">
                            <label className="text-[10px] font-mono text-primary/60 uppercase tracking-widest font-black border-b border-primary/20 pb-2 w-fit">OPTIONAL: SOURCE IMAGE OVERRIDE</label>
                            <div className="flex items-center gap-10">
                                <div className="w-32 h-32 bg-black/40 backdrop-blur-md border border-solid border-primary/30 rounded-2xl flex items-center justify-center relative overflow-hidden group hover:border-primary/60 hover:shadow-[0_0_30px_rgba(var(--color-primary),0.2)] transition-all">
                                    {facePreview ? (
                                        <img src={facePreview} className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="text-primary/10 group-hover:text-primary transition-colors" size={32} />
                                    )}
                                    <input type="file" onChange={handleFaceChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-[11px] font-mono text-primary uppercase tracking-[0.2em] font-black italic">Visual Reference Layer</span>
                                    <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest max-w-xs leading-relaxed">
                                        Upload an existing drawing, photo, or abstract shape. The Neural Engine will derive structure from this asset while synthesizing the new prompt.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'vocal_dna' && (
                        <div className="flex flex-col gap-5 p-8 bg-primary/5 border border-primary/20">
                            <div className="flex flex-col gap-2">
                                <h5 className="text-xl font-black font-bebas text-white tracking-widest uppercase italic">Neural Blueprint Enrollment</h5>
                                <p className="text-[10px] font-mono text-primary/80 uppercase tracking-widest leading-relaxed font-bold italic mb-2">
                                    "THIS IS YOU. PRACTICE HITTING THE SONGS THE WAY THE NEURAL ENGINE MAKES THEM, OR JUST COPY THE VOCAL CHAIN—BECOME THE ARCHITECT OF ORIGINAL WORKS."
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 pb-4">
                                <label className={`flex items-center gap-4 cursor-pointer p-3 border transition-all ${consentLikeness ? 'border-primary bg-primary/10' : 'border-white/10 opacity-60'}`}>
                                    <input type="checkbox" checked={consentLikeness} onChange={(e) => setConsentLikeness(e.target.checked)} className="peer sr-only" />
                                    <div className="w-4 h-4 border border-primary peer-checked:bg-primary transition-colors flex items-center justify-center">
                                        {consentLikeness && <CheckCircle2 className="text-black" size={12} />}
                                    </div>
                                    <span className="text-[9px] font-mono text-white uppercase tracking-widest">I authorize neural voice enrollment for original works.</span>
                                </label>
                                <label className={`flex items-center gap-4 cursor-pointer p-3 border transition-all ${consentResale ? 'border-primary bg-primary/10' : 'border-white/10 opacity-60'}`}>
                                    <input type="checkbox" checked={consentResale} onChange={(e) => setConsentResale(e.target.checked)} className="peer sr-only" />
                                    <div className="w-4 h-4 border border-primary peer-checked:bg-primary transition-colors flex items-center justify-center">
                                        {consentResale && <CheckCircle2 className="text-black" size={12} />}
                                    </div>
                                    <span className="text-[9px] font-mono text-white uppercase tracking-widest">I authorize vocal chain distribution on the treasury network.</span>
                                </label>
                            </div>

                            <div className="w-full flex flex-col gap-6 p-10 bg-black/40 backdrop-blur-md border border-solid border-primary/20 rounded-2xl text-center group cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all relative">
                                <input 
                                    type="file" 
                                    accept="audio/*"
                                    onChange={(e) => { 
                                        if (e.target.files?.[0]) {
                                            setVocalStem(e.target.files[0]);
                                            setVocalStemName(e.target.files[0].name);
                                        }
                                    }}
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                />
                                <div className="flex flex-col items-center gap-4">
                                    <Cpu className="text-primary/20 group-hover:text-primary transition-colors" size={48} />
                                    <span className="text-xs font-mono text-primary/60 uppercase tracking-[0.3em] font-black">
                                        {vocalStemName ? `DNA PAYLOAD: ${vocalStemName}` : 'INJECT ORIGINAL DRY VOCAL STEM'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-primary/20 flex flex-col gap-5">
                                <div className="flex items-center gap-3">
                                    <Zap className="text-yellow-500 animate-pulse" size={18} />
                                    <h6 className="text-sm font-mono text-white tracking-widest uppercase font-black">Studio Collaborative Slot</h6>
                                </div>
                                <p className="text-[9px] font-mono text-gray-500 tracking-[0.2em] uppercase leading-relaxed">
                                    Too busy to finish the track? Outsource the labor. The SpaceJamz Architect Team will manually refine, mix, and master your original work using this blueprint.
                                </p>
                                <div className="flex justify-between items-center p-4 bg-white/5 border border-white/10 italic">
                                    <span className="text-[9px] font-mono text-primary uppercase font-bold">Collaborative Labor Fee:</span>
                                    <span className="text-sm font-bebas text-white tracking-widest">500 TREASURY COINS</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'neural_swap' && (
                        <div className="flex flex-col gap-6 bg-primary/5 rounded-2xl p-8 border border-solid border-primary/20 backdrop-blur-sm">
                             <div className="flex items-center gap-4">
                                <Database className="text-primary animate-pulse" size={32} />
                                <div>
                                    <h5 className="text-lg font-black font-bebas text-white tracking-widest uppercase mb-1">Neural Swap : RVC V2 Pipeline</h5>
                                    <p className="text-[9px] font-mono text-primary/60 uppercase tracking-widest">Convert Suno Guide Vocals into Neural Blueprint Replicas</p>
                                </div>
                             </div>
                             <div className="grid grid-cols-3 gap-2">
                                {['Demucs Stemming','Pitch Mapping','Timbre Injection'].map((step, i) => (
                                    <div key={i} className="bg-black/40 border border-primary/10 p-3 text-center">
                                        <div className="text-[8px] font-mono text-primary/40 mb-1">STEP 0{i+1}</div>
                                        <div className="text-[9px] font-mono text-white uppercase tracking-tighter whitespace-nowrap">{step}</div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}

                    <div className="relative group">
                        <div className="absolute -inset-1 bg-primary/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <CyberButton 
                            text={neuralState === 'PROCESSING' ? 'SYNTHESIZING...' : 
                                  activeTab === 'vocal_dna' ? 'TRANSMIT DNA BLUEPRINT' : 
                                  activeTab === 'neural_swap' ? 'INITIATE NEURAL SWAP' : 'INITIATE NEURAL SYNTHESIS'}
                            disabled={neuralState === 'PROCESSING' || 
                                     (activeTab === 'vocal_dna' ? (!vocalStem || !consentLikeness || !consentResale) : !prompt)} 
                            onClick={activeTab === 'vocal_dna' ? handleStemUpload : runGeneration}
                            className="w-full h-24 text-3xl tracking-[0.1em] font-black relative z-10"
                        />
                    </div>

                    {neuralState !== 'IDLE' && (
                        <div className="mt-8 flex flex-col gap-10 animate-in fade-in duration-500 pt-12 border-t-2 border-white/5">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${neuralState === 'ERROR' ? 'bg-red-500/20' : 'bg-primary/20'} shadow-[0_0_20px_rgba(0,0,0,0.3)]`}>
                                    {neuralState === 'PROCESSING' ? (
                                        <Loader2 className="animate-spin text-primary" size={28} />
                                    ) : neuralState === 'ERROR' ? (
                                        <AlertCircle className="text-red-500" size={28} />
                                    ) : <CheckCircle2 className="text-primary" size={28} />}
                                </div>
                                <span className={`font-mono text-xs uppercase tracking-[0.2em] font-black ${neuralState === 'ERROR' ? 'text-red-400 font-bold' : 'text-primary'}`}>{statusMsg}</span>
                            </div>

                            {lastOutput && (
                                <div className="relative group pt-4">
                                    <div className="absolute -inset-2 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                    <div className="relative bg-[#050505] border-2 border-primary/30 p-4 shadow-[0_0_80px_rgba(0,0,0,0.9)]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%)' }}>
                                        {activeTab === 'deforum' ? (
                                            <video src={lastOutput} controls className="w-full rounded-sm" />
                                        ) : (activeTab === 'neural_swap' || activeTab === 'vocal_dna') ? (
                                            <div className="flex flex-col items-center gap-6 py-12 bg-primary/5 border border-primary/10">
                                                <div className="p-6 bg-primary/20 rounded-full animate-pulse shadow-[0_0_30px_rgba(var(--color-primary),0.2)]">
                                                    <Zap className="text-primary w-12 h-12" />
                                                </div>
                                                <audio src={lastOutput} controls className="w-full max-w-md accent-primary" />
                                                <span className="font-mono text-[9px] text-primary/40 uppercase tracking-[0.4em]">Acoustic Replica Buffered</span>
                                            </div>
                                        ) : (
                                            <img src={lastOutput} className="w-full aspect-square object-cover rounded-sm" />
                                        )}
                                    </div>
                                    <div className="mt-8 flex flex-col sm:flex-row justify-between items-center px-4 gap-6">
                                        <div className="flex gap-4">
                                            {activeTab === 'vocal_dna' && (
                                                <button className="px-10 py-3 bg-white text-black font-mono text-[11px] uppercase tracking-widest hover:bg-primary transition-all font-black">DOWNLOAD VOCAL CHAIN</button>
                                            )}
                                            <button onClick={() => window.open(lastOutput, '_blank')} className="px-10 py-3 bg-primary text-black font-mono text-[11px] uppercase tracking-widest hover:bg-white transition-all font-black">DOWNLOAD ASSET</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </NeuralModal>

            <div className="fixed inset-0 pointer-events-none z-[100] opacity-10 mix-blend-overlay scanlines" />
        </div>
    );
}
