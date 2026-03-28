'use client';
import React, { useState } from 'react';
import { useThemeStore, SpaceTheme } from '@/store/useThemeStore';
import { Globe, RefreshCw, X, Zap, Swords, Trophy, Skull, Crown, Ghost, Droplet, Sparkles, Terminal } from 'lucide-react';
import { CyberButton } from '@/components/ui/CyberButton';

const WORLDS = [
  { id: 'cosmos', name: 'COSMOS', icon: Zap, color: 'text-cyan-400', desc: 'Neural Network Default', core: 'OPT-60', latency: '12ms', type: 'STANDARD' },
  { id: 'battle', name: 'BATTLE', icon: Swords, color: 'text-red-500', desc: 'Symmetric Combat Engine', core: 'WAR-99', latency: '8ms', type: 'HOSTILE' },
  { id: 'arena', name: 'ARENA', icon: Trophy, color: 'text-orange-500', desc: 'High-Performance Matrix', core: 'VFX-1X', latency: '4ms', type: 'COMPETITIVE' },
  { id: 'toxic', name: 'TOXIC', icon: Skull, color: 'text-lime-400', desc: 'Corrosive Visual Override', core: 'BIO-HZ', latency: '18ms', type: 'HAZARD' },
  { id: 'royal', name: 'ROYAL', icon: Crown, color: 'text-yellow-400', desc: 'Legendary Status Vault', core: 'KNG-01', latency: '15ms', type: 'SECURE' },
  { id: 'ghastly', name: 'GHASTLY', icon: Ghost, color: 'text-purple-500', desc: 'Spectral Frequency Shift', core: 'PHM-33', latency: '22ms', type: 'ANOMALY' },
  { id: 'abyss', name: 'ABYSS', icon: Droplet, color: 'text-blue-500', desc: 'Deep Ocean Simulation', core: 'DVK-00', latency: '30ms', type: 'PRESSURE' },
  { id: 'neon', name: 'NEON', icon: Sparkles, color: 'text-pink-500', desc: 'Cyberpunk Overdrive', core: 'NKT-88', latency: '6ms', type: 'OVERDRIVE' },
] as const;

export default function WrldChanger() {
  const { activeTheme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const [originalTheme, setOriginalTheme] = useState(activeTheme);

  const handleOpen = () => {
    setOriginalTheme(activeTheme);
    setIsOpen(true);
  };

  const handleCancel = () => {
    setTheme(originalTheme);
    document.documentElement.className = `theme-${originalTheme}`;
    setIsOpen(false);
  };

  const handleAccept = () => {
    setIsOpen(false);
  };

  const handleSelect = (id: SpaceTheme) => {
    setTheme(id);
    document.documentElement.className = `theme-${id}`;
  };

  const activeWorld = WORLDS.find(w => w.id === activeTheme) || WORLDS[0];
  const ActiveIcon = activeWorld.icon;

  return (
    <>
      {/* CENTRAL ORBITAL GLOBE TRIGGER */}
      <div 
        className="fixed top-6 left-6 z-[9999] group cursor-pointer pointer-events-auto"
        onClick={handleOpen}
      >
        <div className="relative p-3 rounded-none bg-black/60 border border-white/10 backdrop-blur-xl hover:border-primary/50 transition-all duration-500 group-hover:scale-110 shadow-[0_0_20px_rgba(0,0,0,0.4)]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}>
          <Globe className="w-6 h-6 text-primary animate-[spin_10s_linear_infinite]" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <RefreshCw className="w-4 h-4 text-white animate-spin" />
          </div>
          
          <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-black/80 border border-white/10 px-3 py-1.5 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap cyber-card">
            <div className="text-[10px] font-mono tracking-widest text-primary mb-0.5 uppercase italic">SIMULATION TERMINAL</div>
            <div className="text-xs font-bold text-white uppercase">{activeTheme.toUpperCase()}</div>
          </div>
        </div>
      </div>

      {/* FULL COMMAND DECK OVERLAY */}
      <div 
        className={`fixed inset-0 z-[1000] backdrop-blur-3xl transition-all duration-700 flex flex-col items-center justify-center scanlines
          ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
        style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(0,0,0,0.99))' }}
      >
        {/* ATMOSPHERE GLOW */}
        <div className="fixed top-1/2 right-1/4 -translate-y-1/2 w-[70vw] h-[70vh] bg-primary/10 rounded-full blur-[200px] pointer-events-none transition-colors duration-1000" />

        <div className="w-full max-w-7xl h-full max-h-[85vh] flex flex-col md:flex-row gap-6 p-6 mt-8 relative z-20 animate-in fade-in zoom-in-95 duration-500">
            
            {/* LEFT SIDEBAR: MATRIX ARCHIVES */}
            <div className="w-full md:w-1/3 flex flex-col h-full cyber-panel p-6 overflow-hidden">
                <div className="flex items-center gap-2 border-b border-primary/20 pb-4 mb-4">
                    <Terminal className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-mono tracking-[0.2em] text-primary uppercase cyber-flicker-slow">[ MATRIX ARCHIVES ]</h2>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(var(--color-primary), 0.5) transparent' }}>
                    {WORLDS.map((world, i) => {
                        const isActive = activeTheme === world.id;
                        const Icon = world.icon;
                        const delayClass = `desync-${(i % 5) + 1}`;

                        return (
                            <div 
                                key={world.id}
                                onClick={() => handleSelect(world.id)}
                                className={`cyber-card p-4 flex items-center gap-4 cursor-pointer transition-all duration-300 ${delayClass} ${isActive ? 'active-playback' : 'hover:bg-white/5 border-transparent'}`}
                            >
                                <div className={`w-10 h-10 flex items-center justify-center shrink-0 border transition-all duration-300 ${isActive ? `border-primary/50 bg-primary/10 ${world.color} drop-shadow-[0_0_10px_rgba(var(--color-primary),0.8)]` : 'border-white/10 bg-black/40 text-gray-400'}`} style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <span className={`font-black text-lg tracking-widest uppercase truncate ${isActive ? 'text-white' : 'text-gray-400'}`}>{world.name}</span>
                                    <span className="text-[9px] font-mono tracking-widest text-primary/60 uppercase truncate">{world.type}</span>
                                </div>
                                {isActive && (
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping mr-2" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* RIGHT CONSOLE: ENVIRONMENT DIAGNOSTICS */}
            <div className="w-full md:w-2/3 flex flex-col h-full cyber-panel p-8 md:p-12 relative overflow-hidden group">
                
                {/* Massive Background Watermark */}
                <ActiveIcon className={`absolute -bottom-20 -right-20 w-[400px] h-[400px] opacity-[0.03] transition-all duration-1000 ${activeWorld.color} group-hover:scale-110 pointer-events-none`} />

                <div className="flex flex-col relative z-10 flex-1">
                    <div className="inline-flex items-center gap-2 text-primary text-[10px] font-mono tracking-[0.4em] uppercase mb-6 px-4 py-1.5 border border-primary/20 bg-primary/5 w-max cyber-card desync-1">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        ENVIRONMENT DIAGNOSTICS
                    </div>
                    
                    <h1 className="text-6xl md:text-[100px] font-bebas text-white tracking-widest uppercase leading-none mb-2 drop-shadow-[0_0_30px_rgba(var(--color-primary),0.5)] cyber-flicker-fast">
                        {activeWorld.name}
                    </h1>
                    
                    <p className="text-primary font-mono text-sm tracking-[0.3em] uppercase mb-12 border-l-2 border-primary pl-4 desync-2">
                        {activeWorld.desc}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-auto mb-12">
                        {/* Live Telemetry Display */}
                        <div className="cyber-card p-6 bg-black/60 border border-primary/20 desync-3">
                            <h3 className="text-[10px] font-mono text-gray-500 tracking-[0.3em] uppercase mb-4 border-b border-white/10 pb-2">SYSTEM TELEMETRY</h3>
                            
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center text-xs font-mono uppercase">
                                    <span className="text-gray-400">Core Architecture</span>
                                    <span className="text-primary font-bold">{activeWorld.core}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-mono uppercase">
                                    <span className="text-gray-400">Network Latency</span>
                                    <span className="text-white font-bold">{activeWorld.latency}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-mono uppercase">
                                    <span className="text-gray-400">Threat Level</span>
                                    <span className={`${activeWorld.type === 'HOSTILE' || activeWorld.type === 'HAZARD' ? 'text-red-500' : 'text-green-500'} font-bold`}>{activeWorld.type}</span>
                                </div>
                            </div>
                        </div>

                        {/* Audio Reactive Boot Log */}
                        <div className="cyber-card p-6 bg-black/60 border border-primary/20 desync-4 relative overflow-hidden flex flex-col justify-end">
                            <div className="absolute inset-0 bg-primary/5 pointer-events-none transition-all duration-75" style={{ height: `calc(100% * var(--audio-intensity, 0))` }} />
                            
                            <h3 className="text-[10px] font-mono text-gray-500 tracking-[0.3em] uppercase mb-4 border-b border-white/10 pb-2 relative z-10">BOOT SEQUENCE LOG</h3>
                            
                            <div className="flex flex-col gap-1 text-[9px] font-mono text-primary/70 uppercase leading-relaxed relative z-10">
                                <span><span className="text-white/50">{'>'}</span> INITIATING NEURAL HANDSHAKE...</span>
                                <span><span className="text-white/50">{'>'}</span> DECRYPTING {activeWorld.name} ASSETS...</span>
                                <span><span className="text-white/50">{'>'}</span> ALLOCATING MEMORY TO {activeWorld.core}</span>
                                <span className="text-primary font-bold animate-pulse mt-2"><span className="text-white/50">{'>'}</span> SIMULATION ENGAGED</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGID FOOTER CONTROLS */}
                <div className="flex items-center gap-6 mt-auto pt-6 border-t border-primary/20 relative z-10">
                    <CyberButton 
                        onClick={handleCancel}
                        text="ABORT"
                        variant="danger"
                        kbd="ESC"
                        className="flex-1"
                    />
                    <CyberButton
                        onClick={handleAccept}
                        text="INITIALIZE"
                        kbd="ENT"
                        className="flex-1"
                    />
                </div>
            </div>
        </div>
      </div>
    </>
  );
}
