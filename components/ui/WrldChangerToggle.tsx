'use client';

import React, { useState } from 'react';
import { Globe, X } from 'lucide-react';
import { useWorldStore, WORLD_THEMES } from '@/store/useWorldStore';
import WrldCarousel from './WrldCarousel';

export default function WrldChangerToggle() {
    const [isOpen, setIsOpen] = useState(false);
    const activeWorld = useWorldStore(state => state.activeWorld);
    const theme = WORLD_THEMES[activeWorld] || WORLD_THEMES.CYBERDECK_PRIME;

    return (
        <>
            {/* THE FLOATING TOGGLE CRITICAL TO PHASE 3 AESTHETICS */}
            <button 
                onClick={() => setIsOpen(true)}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 relative group pointer-events-auto bg-black/80 backdrop-blur-md"
                style={{ 
                    border: `2px solid ${theme.accent}`,
                    boxShadow: `0 0 15px ${theme.accent}60, inset 0 0 10px ${theme.accent}40`
                }}
                title="WRLD_CHANGER_v3"
            >
                {/* Visual feedback loop for audio reactivity mapping */}
                <div 
                    className="absolute inset-0 rounded-full opacity-20 group-hover:opacity-40 transition-opacity animate-pulse"
                    style={{ backgroundColor: theme.accent }}
                ></div>
                
                <Globe 
                    size={24} 
                    className="relative z-10 transition-transform duration-700 group-hover:rotate-[360deg]" 
                    style={{ color: theme.accent }} 
                />

                {/* Pulsing indicator if active world is not default */}
                {activeWorld !== 'CYBERDECK_PRIME' && (
                    <div 
                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-black z-20 animate-ping"
                        style={{ backgroundColor: theme.accent }}
                    ></div>
                )}
            </button>

            {/* MODAL OVERLAY */}
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div 
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        onClick={() => setIsOpen(false)}
                    ></div>
                    
                    <div className="relative w-full max-w-5xl bg-[#050505] border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                        {/* Header Section */}
                        <div className="p-8 pb-0 flex items-center justify-between">
                            <div className="flex flex-col">
                                <h2 className="font-bebas text-4xl text-white tracking-widest uppercase mb-1">
                                    ENVIRONMENT_OVERRIDE
                                </h2>
                                <p className="font-mono text-[10px] text-primary uppercase tracking-[0.3em] opacity-70">
                                    Select Dimension // Redirecting Neural Flux
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all shadow-lg"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Carousel Mounting Point */}
                        <div className="p-4 md:p-8">
                            <WrldCarousel />
                        </div>

                        {/* Footer Status */}
                        <div className="px-8 py-6 bg-white/5 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="font-mono text-[9px] text-gray-400 uppercase tracking-widest leading-none">
                                    Current_Active_Buffer: <span className="text-white">{theme.name}</span>
                                </span>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="font-bebas text-xl tracking-widest text-[#050505] bg-white px-8 py-2 rounded-xl hover:bg-primary transition-all shadow-xl"
                            >
                                LOCK IN
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
