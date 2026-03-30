'use client';

import { useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { db, storage } from '@/lib/firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ShieldCheck, UploadCloud, FileAudio, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';
import { CyberButton } from '@/components/ui/CyberButton';

export default function NeuralBlueprintEnrollment() {
    const user = useUserStore(state => state.currentUser);
    const [file, setFile] = useState<File | null>(null);
    const [consentLikeness, setConsentLikeness] = useState(false);
    const [consentResale, setConsentResale] = useState(false);
    
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [statusData, setStatusData] = useState<{ type: 'error' | 'success', msg: string } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type.startsWith('audio/')) {
                setFile(selectedFile);
                setStatusData(null);
            } else {
                setStatusData({ type: 'error', msg: 'Neural payload rejected. Use valid HQ audio (.wav, .flac).' });
            }
        }
    };

    const handleEnrollment = async () => {
        if (!user) {
            setStatusData({ type: 'error', msg: 'Identity authentication required for blueprint storage.' });
            return;
        }
        if (!file) {
            setStatusData({ type: 'error', msg: 'No acoustic DNA detected in stream.' });
            return;
        }
        if (!consentLikeness || !consentResale) {
            setStatusData({ type: 'error', msg: 'Biometric authorization required to establish blueprint.' });
            return;
        }

        setIsUploading(true);
        setStatusData(null);

        try {
            const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
            const storagePath = `user_assets/${user.uid}/dna/${Date.now()}_${sanitizedName}`;
            const storageRef = ref(storage, storagePath);
            
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed', 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                }, 
                (error) => {
                    console.error("Storage Error:", error);
                    setStatusData({ type: 'error', msg: 'Secure packet transfer failed. Connection terminated.' });
                    setIsUploading(false);
                }, 
                async () => {
                    const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

                    await addDoc(collection(db, 'user_assets', user.uid, 'vocal_dna'), {
                        artistId: user.uid,
                        fileName: sanitizedName,
                        assetUrl: downloadUrl,
                        type: 'neural_blueprint_source',
                        contracts: {
                            likenessConsent: true,
                            distributionConsent: true,
                            signedAt: serverTimestamp()
                        },
                        status: 'SEQUENCED',
                        createdAt: serverTimestamp()
                    });

                    setStatusData({ 
                        type: 'success', 
                        msg: 'NEURAL BLUEPRINT SEQUENCED. YOUR ACOUSTIC IDENTITY IS NOW STORED IN THE PRIVATE MATRIX.' 
                    });
                    
                    setIsUploading(false);
                    setUploadProgress(0);
                    setFile(null);
                    setConsentLikeness(false);
                    setConsentResale(false);
                }
            );

        } catch (error: any) {
            console.error("Enrollment Exception:", error);
            setStatusData({ type: 'error', msg: 'Critical system failure during Vault transmission.' });
            setIsUploading(false);
        }
    };

    return (
        <div className="relative flex flex-1 w-full flex-col justify-start overflow-visible group/main shrink-0 min-h-max pt-16 pb-0 text-white px-4 bg-black">
            
            {/* AMBIENT BACKGROUND FX */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--color-primary),0.15)_0,transparent_100%)]" />
                <div className="absolute top-0 left-0 w-full h-full scanlines animate-pulse opacity-10" />
            </div>

            <div className="w-full max-w-5xl z-50 animate-in fade-in zoom-in-95 duration-700">
                
                {/* NEURAL IDENTITY GATEWAY (Telemetry Overhaul) */}
                {/* NEURAL IDENTITY GATEWAY DELEGATED TO PERSISTENT LAYOUT ENGINE */}

                {/* HEADERS */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12 border-b-2 border-primary/40 pb-10 relative">
                    <div className="flex items-start gap-5">
                        <div className="p-4 bg-primary/10 border-2 border-primary/30 rounded-full shadow-[0_0_30px_rgba(var(--color-primary),0.2)]">
                            <ShieldCheck className="text-primary w-12 h-12 cyber-flicker-slow" />
                        </div>
                        <div>
                            <h1 className="text-4xl sm:text-6xl font-black tracking-[0.1em] font-bebas uppercase text-white mb-2 italic">
                                Neural Blueprint Enrollment
                            </h1>
                            <p className="text-[10px] font-mono tracking-[0.4em] text-primary/60 uppercase font-black">
                                [ RVC V2 ACOUSTIC IDENTITY SEQUENCING ]
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest mb-1 italic">Authorized Personnel Only</span>
                        <div className="h-1 w-32 bg-primary/20 relative overflow-hidden">
                             <div className="absolute inset-y-0 left-0 w-1/2 bg-primary animate-slide-infinite" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                    
                    {/* LEFT MATRIX: INGESTION */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="bg-[#050505] border-2 border-primary/20 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative group overflow-hidden" 
                             style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%)' }}>
                            <div className="absolute top-0 right-0 p-2 font-mono text-[8px] text-primary/20 uppercase tracking-tighter">Ingestion Terminal v6.0</div>
                            
                            <input 
                                type="file" 
                                accept="audio/*" 
                                onChange={handleFileChange} 
                                disabled={isUploading}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            />
                            
                            <div className="flex flex-col items-center justify-center py-16 text-center relative z-10 pointer-events-none transition-all duration-500 group-hover:scale-[1.02]">
                                {file ? (
                                    <>
                                        <div className="p-6 bg-green-500/10 border-2 border-green-500/30 rounded-full mb-6 relative">
                                            <FileAudio className="w-16 h-16 text-green-500" />
                                            <div className="absolute -bottom-2 -right-2 bg-green-500 p-1 rounded-full shadow-lg">
                                                <CheckCircle2 size={16} className="text-black" />
                                            </div>
                                        </div>
                                        <span className="font-mono text-xs uppercase tracking-[0.3em] text-white font-black mb-1">{file.name}</span>
                                        <span className="font-mono text-[9px] text-green-500/80 uppercase tracking-widest bg-green-500/5 px-4 py-1 border border-green-500/20 italic">
                                            PAYLOAD DETECTED : {(file.size / (1024 * 1024)).toFixed(2)} MB
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <div className="p-6 bg-primary/5 border-2 border-dashed border-primary/20 rounded-full group-hover:border-primary/60 transition-all mb-6">
                                            <UploadCloud className="w-16 h-16 text-primary/40 group-hover:text-primary transition-colors" />
                                        </div>
                                        <span className="font-mono text-sm uppercase tracking-[0.4em] text-primary/80 mb-3 font-black italic">Inject Dry Vocal Stem</span>
                                        <p className="font-mono text-[9px] text-gray-500 uppercase tracking-widest leading-relaxed max-w-xs">
                                            Upload 5-10 minutes of dry, clean vocals to train your high-fidelity RVC V2 Neural Blueprint.
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Progress Bar */}
                            {isUploading && (
                                <div className="absolute inset-x-0 bottom-0 h-2 bg-black/80 z-30">
                                    <div className="h-full bg-primary shadow-[0_0_15px_rgba(var(--color-primary),0.8)] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                </div>
                            )}
                        </div>

                        {/* STATUS MATRIX */}
                        {statusData && (
                            <div className={`p-6 flex items-start gap-5 border-2 animate-in slide-in-from-left-4 duration-300 ${statusData.type === 'error' ? 'border-red-500/40 bg-red-500/5 text-red-500' : 'border-green-500/40 bg-green-500/5 text-green-500'}`}>
                                <div className="p-2 border border-current rounded-full">
                                    {statusData.type === 'error' ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
                                </div>
                                <div>
                                    <span className="block text-[9px] font-mono uppercase tracking-[0.3em] font-black mb-1">System Telemetry:</span>
                                    <p className="text-[10px] font-mono tracking-widest uppercase leading-relaxed font-bold italic">{statusData.msg}</p>
                                </div>
                            </div>
                        )}
                        
                        <div className="p-6 bg-yellow-500/5 border border-yellow-500/20 italic">
                             <p className="text-[9px] font-mono text-yellow-500/80 uppercase tracking-widest leading-relaxed">
                                <span className="font-black underline mr-2">PRO TIP:</span> 
                                For Suno-grade conversion, use the **Neural Swap** terminal after enrollment to replace guide vocals with this Blueprint.
                             </p>
                        </div>
                    </div>

                    {/* RIGHT MATRIX: PROTOCOLS */}
                    <div className="lg:col-span-2 flex flex-col h-full space-y-6">
                        <div className="bg-[#050505] border-2 border-primary/40 p-1 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex-1 overflow-hidden" 
                             style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}>
                            <div className="p-8 h-full flex flex-col justify-between space-y-8 bg-black">
                                
                                <div className="space-y-8">
                                    <h3 className="text-sm font-black font-bebas text-white tracking-[0.2em] uppercase flex items-center gap-3 border-b border-white/10 pb-4 italic">
                                        <Zap className="w-5 h-5 text-yellow-500 animate-pulse" /> Neural Consent Contracts
                                    </h3>

                                    {/* PROTOCOL A */}
                                    <label className={`flex items-start gap-4 cursor-pointer p-5 border-2 transition-all ${consentLikeness ? 'border-primary bg-primary/5' : 'border-white/5 hover:border-white/20 hover:bg-white/5'}`}>
                                        <div className="relative flex items-center justify-center mt-1">
                                            <input type="checkbox" className="peer sr-only" checked={consentLikeness} onChange={(e) => setConsentLikeness(e.target.checked)} disabled={isUploading} />
                                            <div className="w-5 h-5 border-2 border-primary/40 peer-checked:border-primary peer-checked:bg-primary transition-all flex items-center justify-center rounded-sm">
                                                {consentLikeness && <CheckCircle2 size={12} className="text-black" />}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <span className="block text-[11px] font-black text-white uppercase tracking-wider mb-2 italic">Acoustic Identity Release</span>
                                            <p className="block text-[8px] font-mono text-gray-500 tracking-widest leading-relaxed uppercase">
                                                Grant permission to cryptographically clone and refine your voice for original production within the Neural Studio.
                                            </p>
                                        </div>
                                    </label>

                                    {/* PROTOCOL B */}
                                    <label className={`flex items-start gap-4 cursor-pointer p-5 border-2 transition-all ${consentResale ? 'border-primary bg-primary/5' : 'border-white/5 hover:border-white/20 hover:bg-white/5'}`}>
                                        <div className="relative flex items-center justify-center mt-1">
                                            <input type="checkbox" className="peer sr-only" checked={consentResale} onChange={(e) => setConsentResale(e.target.checked)} disabled={isUploading} />
                                            <div className="w-5 h-5 border-2 border-primary/40 peer-checked:border-primary peer-checked:bg-primary transition-all flex items-center justify-center rounded-sm">
                                                {consentResale && <CheckCircle2 size={12} className="text-black" />}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <span className="block text-[11px] font-black text-white uppercase tracking-wider mb-2 italic">Neural Network Distribution</span>
                                            <p className="block text-[8px] font-mono text-gray-500 tracking-widest leading-relaxed uppercase">
                                                Authorize the generation of and distribution of Vocal Chains (mixing presets) derived from this Blueprint.
                                            </p>
                                        </div>
                                    </label>
                                </div>

                                <CyberButton 
                                    onClick={handleEnrollment} 
                                    disabled={!file || !consentLikeness || !consentResale || isUploading}
                                    text={isUploading ? `UPLOADING...` : "SEQUENCED BLUEPRINT"}
                                    className="w-full h-16 text-xl tracking-[0.2em]"
                                />
                            </div>
                        </div>

                        {/* WARNING READOUT */}
                        <div className="bg-red-500/10 border-2 border-red-500/20 p-5 font-mono text-[8px] uppercase tracking-widest text-red-500/80 leading-relaxed shadow-lg">
                            <span className="font-black text-red-500 block mb-2 underline">!!! LEGAL CLEARANCE !!!</span>
                            Ensure you have full ownership of the uploaded audio stems. Unauthorized biometric injection will result in immediate treasury forfeiture and neural ban.
                        </div>
                    </div>

                </div>
            </div>
            
            {/* FOOTER METRICS */}
            <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-between items-center pointer-events-none z-[100]">
                <div className="flex gap-10">
                    <div className="flex flex-col">
                        <span className="text-[7px] font-mono text-primary/30 uppercase tracking-[0.5em]">Network:</span>
                        <span className="text-[9px] font-mono text-primary uppercase font-black">ENROLLMENT_SECURED_TCP</span>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[7px] font-mono text-primary/30 uppercase tracking-[0.5em]">Protocol:</span>
                    <span className="text-[9px] font-mono text-primary uppercase font-black">RVC_V2_BLUEPRINT</span>
                </div>
            </div>
        </div>
    );
}
