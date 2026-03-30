'use client';
import { useWorldStore, WORLD_THEMES } from '@/store/useWorldStore';
import { Globe } from 'lucide-react';

export default function WrldCarousel() {
    const activeWorld = useWorldStore(state => state.activeWorld);
    const setActiveWorld = useWorldStore(state => state.setActiveWorld);
    const themes = Object.values(WORLD_THEMES);

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col pointer-events-auto mt-12 px-0 md:px-0">
            <div className="flex items-center gap-4 mb-4 md:mb-6 px-4 md:px-2">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl border border-primary/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(var(--color-primary)/0.3)] transition-colors duration-500" style={{ backgroundColor: 'rgba(var(--color-primary) / 0.1)' }}>
                    <Globe size={20} className="md:w-6 md:h-6" style={{ color: 'rgb(var(--color-primary))' }} />
                </div>
                <div className="flex flex-col">
                    <h3 className="font-bebas text-2xl md:text-3xl text-white tracking-widest uppercase mb-1 transition-all duration-500" style={{ textShadow: '0 0 15px rgba(var(--color-primary) / 0.4)' }}>World Environment Engine</h3>
                    <p className="font-mono text-[9px] md:text-[10px] text-gray-400 uppercase tracking-[0.2em]">Live DOM CSS UI Accent Transpiler</p>
                </div>
            </div>

            <div className="w-full overflow-x-auto custom-scrollbar pb-6 flex gap-4 snap-x px-4 md:px-2">
                {themes.map((theme) => {
                    const isActive = activeWorld === theme.id;
                    return (
                        <div 
                            key={theme.id}
                            onClick={() => setActiveWorld(theme.id)}
                            className={`relative shrink-0 w-[200px] sm:w-[240px] md:w-64 h-28 md:h-32 rounded-2xl flex flex-col justify-end p-4 cursor-pointer overflow-hidden transition-all duration-500 snap-center group border bg-black/40 backdrop-blur-md ${isActive ? 'border-white/50 scale-100' : 'border-white/10 hover:border-white/30 scale-95 hover:scale-100 opacity-60 hover:opacity-100'}`}
                            style={{ boxShadow: isActive ? `0 0 40px ${theme.accent}40` : 'none' }}
                        >
                            {/* Inner Component CSS Preview using native theme geometry */}
                            <div className="absolute inset-0 opacity-40 group-hover:opacity-80 transition-opacity duration-1000" style={{ background: theme.bgCss }}></div>
                            
                            <div className="relative z-10 flex flex-col pointer-events-none">
                                <span className={`font-mono text-[9px] uppercase tracking-widest mb-1 mix-blend-screen transition-colors ${isActive ? 'text-white font-bold' : 'text-white/50'}`}>
                                    {isActive ? 'ACTIVE_NODE' : 'OFFLINE'}
                                </span>
                                <span className="font-bebas text-xl md:text-2xl tracking-widest uppercase text-white drop-shadow-md mix-blend-screen">{theme.name}</span>
                            </div>
                            
                            {/* Accent Physics Edge Burn */}
                            <div className={`absolute bottom-0 left-0 h-[3px] md:h-[4px] transition-all duration-700 ease-out shadow-[0_0_15px_currentColor]`} style={{ backgroundColor: theme.accent, width: isActive ? '100%' : '0%', color: theme.accent }}></div>
                            
                            {/* Hover Expansion Bar */}
                            <div className={`absolute bottom-0 left-0 h-[1px] md:h-[2px] transition-all duration-300 w-full opacity-0 group-hover:opacity-100`} style={{ backgroundColor: theme.accent }}></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
