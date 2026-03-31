import React from 'react';
import { CheckCircle2, Cpu } from 'lucide-react';

interface VocalDnaPanelProps {
    consentLikeness: boolean;
    setConsentLikeness: (val: boolean) => void;
    consentResale: boolean;
    setConsentResale: (val: boolean) => void;
    vocalStemName: string | null;
    setVocalStem: (file: File) => void;
    setVocalStemName: (name: string) => void;
}

export default function VocalDnaPanel({ 
    consentLikeness, setConsentLikeness, 
    consentResale, setConsentResale, 
    vocalStemName, setVocalStem, setVocalStemName 
}: VocalDnaPanelProps) {
    return (
        <div className="flex flex-col gap-6 sm:gap-8 p-6 sm:p-10 bg-primary/5 border border-primary/20 rounded-2xl">
            <div className="flex flex-col gap-3">
                <h5 className="text-2xl font-black font-bebas text-white tracking-widest uppercase italic">Neural Enrollment</h5>
                <p className="text-[10px] font-mono text-primary/60 uppercase tracking-widest leading-relaxed">
                    AUTHORIZE NEURAL ACCESS TO BIOMETRIC DNA FOR SYTHESIS OF ORIGINAL MISSION ASSETS.
                </p>
            </div>
            <div className="flex flex-col gap-4">
                <label className={`flex items-center gap-4 cursor-pointer p-4 border transition-all ${consentLikeness ? 'border-primary bg-primary/10' : 'border-white/10 opacity-40 hover:opacity-100 hover:border-white/30'}`}>
                    <input type="checkbox" checked={consentLikeness} onChange={(e) => setConsentLikeness(e.target.checked)} className="peer sr-only" />
                    <div className="w-5 h-5 border-2 border-primary/40 peer-checked:bg-primary transition-all flex items-center justify-center">
                        {consentLikeness && <CheckCircle2 className="text-black" size={14} />}
                    </div>
                    <span className="text-[9px] font-mono text-white uppercase tracking-widest font-black italic">Authorize Identity Enrollment</span>
                </label>
                <label className={`flex items-center gap-4 cursor-pointer p-4 border transition-all ${consentResale ? 'border-primary bg-primary/10' : 'border-white/10 opacity-40 hover:opacity-100 hover:border-white/30'}`}>
                    <input type="checkbox" checked={consentResale} onChange={(e) => setConsentResale(e.target.checked)} className="peer sr-only" />
                    <div className="w-5 h-5 border-2 border-primary/40 peer-checked:bg-primary transition-all flex items-center justify-center">
                        {consentResale && <CheckCircle2 className="text-black" size={14} />}
                    </div>
                    <span className="text-[9px] font-mono text-white uppercase tracking-widest font-black italic">Authorize Chain Distribution</span>
                </label>
            </div>

            <div className="w-full flex flex-col gap-6 sm:gap-8 p-6 sm:p-12 bg-black/60 border-2 border-dashed border-primary/20 rounded-2xl sm:rounded-3xl text-center group cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <input 
                    type="file" 
                    accept="audio/*"
                    onChange={(e) => { 
                        if (e.target.files?.[0]) {
                            setVocalStem(e.target.files[0]);
                            setVocalStemName(e.target.files[0].name);
                        }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                />
                <div className="flex flex-col items-center gap-5 relative z-0">
                    <div className="p-5 rounded-full bg-primary/10 border border-primary/20 group-hover:scale-110 transition-transform duration-700">
                        <Cpu className="text-primary/40 group-hover:text-primary transition-colors animate-pulse" size={40} />
                    </div>
                    <span className="text-[11px] font-mono text-primary uppercase tracking-[0.4em] font-black">
                        {vocalStemName ? `ENROLLED: ${vocalStemName}` : 'INJECT DRY VOCAL STEM'}
                    </span>
                </div>
            </div>
        </div>
    );
}
