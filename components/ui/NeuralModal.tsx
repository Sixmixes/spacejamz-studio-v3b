'use client';

import { X, Cpu } from 'lucide-react';
import { useEffect, useState } from 'react';

interface NeuralModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const NeuralModal = ({ isOpen, onClose, title, children }: NeuralModalProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200000] flex items-start sm:items-center justify-center p-0 sm:p-4 lg:p-8 animate-in fade-in duration-500 backdrop-blur-sm bg-black/80">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/95 transition-opacity" onClick={onClose} />
            
            {/* Modal Container */}
            <div className="relative w-full min-h-[100vh] sm:min-h-0 sm:h-auto max-w-[100vw] sm:max-w-[96vw] 2xl:max-w-[1800px] flex flex-col bg-[#050505] border-0 sm:border-2 border-primary/20 sm:shadow-[0_0_120px_rgba(0,0,0,1)] group animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-700 sm:duration-1000" 
                 style={{ 
                    clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%)',
                    filter: 'drop-shadow(0 0-40px rgba(var(--color-primary), 0.15))'
                 }}>
                
                {/* Tactical Overlays */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.08] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%),linear-gradient(90deg,rgba(var(--color-primary),0.02),rgba(var(--color-primary),0.01),rgba(var(--color-primary),0.02))] z-10 bg-[length:100%_4px,100%_100%] pointer-events-none" />
                <div className="absolute inset-0 pointer-events-none border border-primary/10 group-hover:border-primary/20 transition-all duration-1000 z-10" />
                
                {/* Corner Accents */}
                <div className="absolute top-0 right-0 w-24 h-1 bg-primary/40 animate-pulse z-20" />
                <div className="absolute bottom-0 left-0 w-24 h-1 bg-primary/40 animate-pulse z-20" />

                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-8 border-b border-primary/20 bg-primary/5 relative z-20 shrink-0 overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary animate-pulse" />
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-4">
                            <Cpu size={18} className="text-primary animate-pulse" />
                            <h2 className="text-4xl font-black font-bebas text-white tracking-[0.1em] uppercase italic leading-none drop-shadow-[0_2px_15px_rgba(var(--color-primary),0.4)]">
                                {title}
                            </h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[9px] font-mono text-primary/40 uppercase tracking-[0.5em] font-black">Neural_Link_OK</span>
                            <div className="w-1 h-1 rounded-full bg-green-500 animate-ping" />
                        </div>
                    </div>

                    <button 
                        onClick={onClose}
                        className="p-4 bg-black border-2 border-primary/30 text-primary hover:bg-primary hover:text-black hover:scale-110 transition-all shadow-[0_0_15px_rgba(var(--color-primary),0.2)] active:scale-95"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)' }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content Realm */}
                <div className="relative z-20 flex-1 p-4 sm:p-6 md:p-12 overflow-y-auto custom-scrollbar bg-gradient-to-b from-transparent to-black/60">
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(var(--color-primary),0.02)_0,transparent_100%)] opacity-30" />
                    {children}
                </div>

                {/* Tactical Footer / Metadata */}
                <div className="flex items-center justify-between px-4 sm:px-10 py-3 sm:py-4 bg-primary/5 border-t border-primary/10 relative z-20 shrink-0 overflow-hidden">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[7px] font-mono text-primary/30 uppercase tracking-widest">Sys_Status:</span>
                            <span className="text-[9px] font-mono text-primary uppercase font-black">Authorized_Access</span>
                        </div>
                        <div className="w-[1px] h-6 bg-primary/10" />
                        <div className="flex flex-col">
                            <span className="text-[7px] font-mono text-primary/30 uppercase tracking-widest">Access_PT:</span>
                            <span className="text-[9px] font-mono text-primary uppercase font-black">FOUNDRY_MOD_06</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
