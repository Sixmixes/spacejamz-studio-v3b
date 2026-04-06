import React from 'react';
import { ImageIcon, Music, FileText, Microchip, ShoppingBag, Trash2 } from 'lucide-react';
import { CyberButton } from '@/components/ui/CyberButton';

interface MatrixSidebarProps {
    activeTab: 'neural' | 'acoustic' | 'script' | 'dna' | 'arsenal' | 'trash';
    setActiveTab: (tab: 'neural' | 'acoustic' | 'script' | 'dna' | 'arsenal' | 'trash') => void;
    generationsCount: number;
    trashCount: number;
    isSwipeDeckView: boolean;
    setIsSwipeDeckView: (val: boolean) => void;
    setIsStudioOpen: (val: boolean) => void;
}

export default function MatrixSidebar({
    activeTab, setActiveTab, generationsCount, trashCount, isSwipeDeckView, setIsSwipeDeckView, setIsStudioOpen
}: MatrixSidebarProps) {
    return (
        <div className="w-full md:w-64 lg:w-72 shrink-0 flex flex-col justify-start gap-0 md:gap-4 md:sticky md:top-24 z-40">
            {/* TACTICAL NAVIGATION (POD CATEGORIES) */}
            <div className="flex sm:grid sm:grid-cols-6 md:flex md:flex-col gap-2 md:gap-3 overflow-x-auto md:overflow-visible pb-2 pt-0 md:pt-0 px-2 md:px-0 scrollbar-none snap-x snap-mandatory mask-fade-edges-x md:mask-none sticky top-[56px] md:static z-50 bg-black/90 md:bg-transparent backdrop-blur-md md:backdrop-blur-none -mx-2 md:mx-0">
                {(['neural', 'acoustic', 'script', 'dna', 'arsenal', 'trash'] as const).map((tab) => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        className={`shrink-0 w-[140px] sm:w-auto md:w-full snap-center flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start gap-1 md:gap-4 p-2 md:p-4 transition-all duration-300 border relative overflow-hidden group shadow-[0_5px_15px_rgba(0,0,0,0.5)] ${activeTab === tab ? (tab === 'trash' ? 'bg-red-500/10 text-red-500 border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-[#00ffff]/10 text-[#00ffff] border-[#00ffff]/80 shadow-[0_0_20px_rgba(0,255,255,0.2)] md:translate-x-2') : 'bg-[#050505] text-white/70 font-bold border-white/10 hover:border-[#00ffff]/50 hover:bg-[#00ffff]/5 hover:text-white md:hover:translate-x-1'} ${(tab === 'trash' && trashCount > 40) ? 'animate-pulse border-red-500/50 text-red-500' : ''}`}
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}
                    >
                        <div className="flex items-center justify-center md:w-[18px] md:h-[18px] shrink-0">
                            {tab === 'neural' && <ImageIcon size={16} className={`${activeTab === tab ? 'animate-pulse text-[#00ffff]' : 'text-primary/60'}`} />}
                            {tab === 'acoustic' && <Music size={16} className={`${activeTab === tab ? 'animate-pulse text-[#00ffff]' : 'text-primary/60'}`} />}
                            {tab === 'script' && <FileText size={16} className={`${activeTab === tab ? 'animate-pulse text-[#00ffff]' : 'text-primary/60'}`} />}
                            {tab === 'dna' && <Microchip size={16} className={`${activeTab === tab ? 'animate-pulse text-[#00ffff]' : 'text-primary/60'}`} />}
                            {tab === 'arsenal' && <ShoppingBag size={16} className={`${activeTab === tab ? 'animate-pulse text-[#00ffff]' : 'text-primary/60'}`} />}
                            {tab === 'trash' && <Trash2 size={16} className={`${activeTab === tab || trashCount > 40 ? 'animate-pulse text-red-500' : 'text-primary/60'}`} />}
                        </div>
                        <span className="font-mono text-[10px] md:text-[11px] md:text-left text-center font-black uppercase tracking-[0.05em] px-1 md:px-0 mt-1 md:mt-0 leading-tight">
                            {tab === 'neural' ? 'Neural Archives' : 
                             tab === 'acoustic' ? 'Acoustic Vault' : 
                             tab === 'script' ? 'Neural Script' : 
                             tab === 'dna' ? 'DNA Sequencer' : 
                             tab === 'trash' ? `Trash [${trashCount}/50]` : 'Cosmetic Arsenal'}
                        </span>
                        {/* Status Light */}
                        <div className={`absolute top-1.5 right-1.5 md:top-1/2 md:-translate-y-1/2 md:right-4 w-1.5 h-1.5 rounded-full ${activeTab === tab ? (tab === 'trash' ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]' : 'bg-[#00ffff] shadow-[0_0_5px_rgba(0,255,255,0.8)]') : (tab === 'trash' && trashCount > 40 ? 'bg-red-500 animate-pulse' : 'bg-primary/20')}`} />
                    </button>
                ))}
            </div>

            {/* CONTEXTUAL SUB-ACTIONS (Universal) */}
            <div className="flex flex-col gap-2 md:gap-3 mt-1 md:mt-4 px-2 md:px-0 relative z-30">
                {activeTab === 'neural' && (
                    <>
                        <CyberButton text="OPEN STUDIO" onClick={() => setIsStudioOpen(true)} className="w-full text-xs h-12" />
                        {generationsCount > 0 && !isSwipeDeckView && (
                            <button 
                                onClick={() => setIsSwipeDeckView(true)}
                                className="font-mono text-[10px] uppercase tracking-widest text-[#00ffff]/60 hover:text-[#00ffff] transition-colors border border-[#00ffff]/20 hover:border-[#00ffff]/50 bg-black/40 py-3 w-full"
                                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}
                            >
                                [ SWIPE DECK ]
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
