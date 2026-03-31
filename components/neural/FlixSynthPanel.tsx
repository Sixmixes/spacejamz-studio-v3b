import React from 'react';
import { ImageIcon } from 'lucide-react';

interface FlixSynthPanelProps {
    facePreview: string | null;
    handleFaceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FlixSynthPanel({ facePreview, handleFaceChange }: FlixSynthPanelProps) {
    return (
        <div className="flex flex-col gap-4 sm:gap-6 bg-primary/5 p-5 sm:p-8 border border-primary/10 relative overflow-hidden group/opt">
            <div className="absolute top-0 right-0 w-2 h-full bg-primary/5 group-hover/opt:bg-primary/20 transition-all" />
            <label className="text-[10px] font-mono text-primary/80 uppercase tracking-widest font-black border-b border-primary/20 pb-3 w-fit">
                OPTIONAL: SOURCE_IMAGE_OVERRIDE
            </label>
            <div className="flex items-center gap-8">
                <div className="w-28 h-28 bg-black/60 backdrop-blur-md border-[1px] border-solid border-primary/30 rounded-2xl flex items-center justify-center relative overflow-hidden group hover:border-primary/80 hover:shadow-[0_0_40px_rgba(var(--color-primary),0.2)] transition-all flex-shrink-0">
                    {facePreview ? (
                        <img src={facePreview} className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon className="text-primary/20 group-hover:text-primary transition-colors" size={32} />
                    )}
                    <input type="file" onChange={handleFaceChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-mono text-primary uppercase tracking-[0.2em] font-black italic">Reference Layer</span>
                    <p className="text-[9px] font-mono text-gray-400 uppercase tracking-widest leading-relaxed">
                        The Neural Engine derives global structure from this asset during synthesis.
                    </p>
                </div>
            </div>
        </div>
    );
}
