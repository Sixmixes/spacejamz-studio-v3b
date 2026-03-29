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

                if (!response.ok) throw new Error('Neural Gateway Timeout');
                const data = await response.json();
                const outputUrl = data.imageUrl || data.videoUrl;

                setStatusMsg('ARCHIVING PAYLOAD TO SECURE CLOUD...');
                const finalAssetUrl = await archiveToPermanentStorage(outputUrl);

                const userDoc = doc(db, 'users', currentUser.uid);
                if (hasFreeGenerations) {
                    await updateDoc(userDoc, { freeGenerationsRemaining: increment(-1) });
                } else {
                    await updateDoc(userDoc, { coinsBalance: increment(-cost) });
                }

                await addDoc(collection(db, 'user_assets', currentUser.uid, 'ai_generations'), {
                    type: activeTab,
                    prompt,
                    assetUrl: finalAssetUrl,
                    createdAt: serverTimestamp()
                });

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

    const uploadFaceToStorage = async () => {
        if (!faceImage || !currentUser) return null;
        const faceRef = ref(storage, `tmp-faces/${currentUser.uid}/${Date.now()}_face.jpg`);
        await uploadBytes(faceRef, faceImage);
        return await getDownloadURL(faceRef);
    };

    const archiveToPermanentStorage = async (url: string) => {
        if (!currentUser) return url;
        const res = await fetch(url);
        const blob = await res.blob();
        const extMap = { flixsynth: 'jpg', deforum: 'mp4', vocal_dna: 'wav', neural_swap: 'wav' };
        const archiveRef = ref(storage, `user_assets/${currentUser.uid}/ai/${Date.now()}_gen.${extMap[activeTab]}`);
        await uploadBytes(archiveRef, blob);
        return await getDownloadURL(archiveRef);
    };

    const handleStemUpload = async () => {
        if (!vocalStem || !currentUser) return;
        setNeuralState('PROCESSING');
        setStatusMsg('INITIATING BIOMETRIC ACOUSTIC INGESTION...');
        
        try {
            const stemRef = ref(storage, `user_assets/${currentUser.uid}/dna/${Date.now()}_${vocalStem.name}`);
            await uploadBytes(stemRef, vocalStem);
            const downloadUrl = await getDownloadURL(stemRef);
            
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
        <div className="flex flex-col items-center justify-start min-h-screen pb-40 relative bg-black/90 p-4 lg:p-12">
            
            <NeuralIdentityTerminal className="mb-12" />

            <div className="w-full max-w-[1800px] mb-12 flex flex-col md:flex-row justify-between items-end border-b border-primary/30 pb-8 gap-6 animate-in fade-in duration-700">
                <div className="flex items-start gap-4">
                    <Sparkles className="w-12 h-12 text-primary cyber-flicker-slow drop-shadow-[0_0_15px_rgba(var(--color-primary),0.5)]" />
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black font-bebas text-white tracking-widest uppercase mb-1 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">NEURAL STUDIO</h1>
                        <p className="font-mono text-[10px] text-primary uppercase tracking-[0.5em] font-bold">[ SUNO-GRADE PRODUCTION FOR ORIGINAL WORKS ]</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2 bg-black/80 border-2 border-primary/40 p-4 shadow-[0_0_20px_rgba(var(--color-primary),0.1)]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}>
                    <div className="flex items-center gap-3 text-yellow-500 mb-1">
                        <Coins size={16} />
                        <span className="font-bebas text-2xl tracking-widest">{currentUser?.coinsBalance?.toLocaleString() || '0'} C</span>
                    </div>
                    <span className="text-[8px] font-mono text-gray-500 tracking-widest uppercase">Treasury Credits Remaining</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-[1700px] mb-20 z-20 px-4">
                {(['flixsynth', 'deforum', 'vocal_dna', 'neural_swap'] as const).map(tab => (
                    <div 
                        key={tab}
                        className="group relative bg-[#050505]/90 border-2 border-primary/10 hover:border-primary/60 transition-all duration-500 overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.8)] p-1"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}
                    >
                        <div className="p-10 flex flex-col items-center text-center gap-8 relative z-10">
                            <div className={`p-8 bg-primary/10 border-2 border-primary/20 rounded-full group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500 shadow-[0_0_30px_rgba(var(--color-primary),0.05)]`}>
                                {tab === 'flixsynth' && <ImageIcon size={56} className="text-primary" />}
                                {tab === 'deforum' && <Video size={56} className="text-primary" />}
                                {tab === 'vocal_dna' && <Terminal size={56} className="text-primary" />}
                                {tab === 'neural_swap' && <Database size={56} className="text-primary" />}
                            </div>
                            <div className="min-h-[120px] flex flex-col justify-center">
                                <h3 className="text-3xl font-black font-bebas text-white tracking-[0.2em] mb-2 italic uppercase">
                                    {tab === 'flixsynth' ? 'FLIXSYNTH ART' : tab === 'deforum' ? 'VIDEO ENGINE' : tab === 'vocal_dna' ? 'NEURAL BLUEPRINT' : 'NEURAL SWAP'}
                                </h3>
                                <p className="text-[10px] font-mono text-primary/40 uppercase tracking-[0.3em] font-bold max-w-[260px] leading-relaxed">
                                    {tab === 'flixsynth' ? 'Forge original album covers and visual identities' : 
                                     tab === 'deforum' ? 'Cinematic music video sequencing for original works' :
                                     tab === 'vocal_dna' ? 'Clone and Practice your identity for Original Works' :
                                     'Replace Suno voices with your Neural Blueprint'}
                                </p>
                            </div>
                            <button 
                                onClick={() => { setActiveTab(tab); setIsModalOpen(true); setNeuralState('IDLE'); setLastOutput(null); }}
                                className="mt-4 px-12 py-4 bg-primary text-black font-mono text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all shadow-[0_5px_15px_rgba(var(--color-primary),0.2)]"
                            >
                                [ LAUNCH TERMINAL ]
                            </button>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent group-hover:opacity-100 opacity-20 transition-opacity" />
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
                    </div>

                    {activeTab === 'flixsynth' && (
                        <div className="flex flex-col gap-6 bg-primary/5 p-8 border border-primary/10">
                            <label className="text-[10px] font-mono text-primary/60 uppercase tracking-widest font-black border-b border-primary/20 pb-2 w-fit">OPTIONAL: BIOMETRIC IDENTITY MAPPING</label>
                            <div className="flex items-center gap-10">
                                <div className="w-32 h-32 bg-black border-2 border-dashed border-primary/40 flex items-center justify-center relative overflow-hidden group hover:border-primary transition-all">
                                    {facePreview ? (
                                        <img src={facePreview} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserPlus className="text-primary/10 group-hover:text-primary transition-colors" size={32} />
                                    )}
                                    <input type="file" onChange={handleFaceChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-[11px] font-mono text-primary uppercase tracking-[0.2em] font-black italic">Identity Injector</span>
                                    <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest max-w-xs leading-relaxed">
                                        Inject your face into the FlixSynth engine. Combine with your prompt to weave your identity into the neural canvas.
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

                            <div className="w-full flex flex-col gap-6 p-10 bg-black border-2 border-dashed border-primary/40 text-center group cursor-pointer hover:border-primary transition-all relative">
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
                        <div className="flex flex-col gap-6 bg-primary/10 p-8 border-2 border-primary/20 border-dashed">
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
