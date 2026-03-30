'use client';
import React, { useState, useEffect, useRef, memo } from 'react';
import { createPortal } from 'react-dom';
import { useWorldStore } from '@/store/useWorldStore';
import { useAudioStore } from '@/store/useAudioStore';
import { Globe, RefreshCw, Database, Zap, Swords, Trophy, Skull, Crown, Ghost, Droplet, Sparkles } from 'lucide-react';
import { CyberButton } from '@/components/ui/CyberButton';

const WORLDS = [
  { id: 'CYBERDECK_PRIME', name: 'CYBERDECK PRIME', icon: Zap, color: 'text-fuchsia-500', desc: 'Neural Network Default', core: 'OPT-60', latency: '12ms', type: 'STANDARD' },
  { id: 'ABYSSAL_SINGULARITY', name: 'ABYSSAL SINGULARITY', icon: Droplet, color: 'text-indigo-500', desc: 'Deep Void Engine', core: 'DVK-00', latency: '8ms', type: 'PRESSURE' },
  { id: 'SOLAR_SUPERNOVA', name: 'SOLAR SUPERNOVA', icon: Zap, color: 'text-orange-600', desc: 'Maximum Saturation Array', core: 'MAGMA', latency: '1ms', type: 'CRITICAL' },
  { id: 'SILICON_GRAVE', name: 'SILICON GRAVE', icon: Skull, color: 'text-orange-800', desc: 'Corrosive Override', core: 'BIO-HZ', latency: '18ms', type: 'HAZARD' },
  { id: 'SECTOR_7_SYNDICATE', name: 'SECTOR 7 SYNDICATE', icon: Swords, color: 'text-cyan-400', desc: 'Symmetric Combat Engine', core: 'WAR-99', latency: '8ms', type: 'HOSTILE' },
  { id: 'QUANTUM_MATRIX', name: 'QUANTUM MATRIX', icon: Database, color: 'text-emerald-400', desc: 'Asset Management Monolith', core: 'DB-X1', latency: '15ms', type: 'STABLE' },
  { id: 'ZERO_G_ANOMALY', name: 'ZERO-G ANOMALY', icon: Ghost, color: 'text-slate-400', desc: 'Spectral Frequency Shift', core: 'PHM-33', latency: '22ms', type: 'ANOMALY' },
  { id: 'ASTRAL_PROJECTION', name: 'ASTRAL PROJECTION', icon: Sparkles, color: 'text-white', desc: 'High Contrast Null Space', core: '0x00', latency: '0ms', type: 'MONOCHROME' },
  { id: 'LIQUID_CHROME', name: 'LIQUID CHROME', icon: Database, color: 'text-gray-300', desc: 'Metallic Flux Generator', core: 'CRM-12', latency: '15ms', type: 'SECURE' },
  { id: 'NEON_DOJO', name: 'NEON DOJO', icon: Trophy, color: 'text-rose-600', desc: 'High-Performance Matrix', core: 'VFX-1X', latency: '4ms', type: 'COMPETITIVE' },
] as const;

// MEMOIZED SIMULATION CARD TO PREVENT NEURAL THRASH
const SimulationCard = memo(({ world, isActive, i, handleSelect }: {
  world: typeof WORLDS[number],
  isActive: boolean,
  i: number,
  handleSelect: (id: string) => void
}) => {
  const delayClass = `desync-${(i % 5) + 1}`;
  const Icon = world.icon;

  return (
    <div
      onClick={() => handleSelect(world.id)}
      className={`cyber-card p-4 flex items-center gap-4 cursor-pointer transition-all duration-500 ${delayClass} ${isActive ? 'bg-primary/20 border-primary shadow-[inset_0_0_20px_rgb(var(--color-primary) / 0.3)]' : 'bg-black/60 border-white/5 hover:bg-white/5 border-transparent group'}`}
      style={{
        boxShadow: isActive ? `0 0 calc(var(--audio-intensity, 0) * 40px) rgb(var(--color-primary) / 0.4)` : 'none',
        borderColor: isActive ? `rgb(var(--color-primary) / calc(0.3 + var(--audio-intensity, 0) * 0.7))` : undefined
      }}
    >
      <div className={`w-10 h-10 flex items-center justify-center shrink-0 border transition-all duration-500 ${isActive ? `border-primary bg-primary/30 ${world.color} drop-shadow-[0_0_20px_rgb(var(--color-primary))] scale-110` : `border-white/10 bg-black/40 ${world.color} drop-shadow-[0_0_10px_rgb(var(--color-primary)/0.2)] transition-all`}`} style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}>
        <Icon className={`w-5 h-5 ${world.color} transition-transform`} style={{ transform: `scale(calc(1 + var(--audio-intensity, 0) * 0.2))` }} />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span className={`font-black text-lg tracking-widest uppercase truncate transition-all duration-500 ${isActive ? 'text-white' : 'text-gray-400'}`}>{world.name}</span>
        <span className={`text-[9px] font-mono tracking-widest uppercase truncate transition-colors duration-500 ${isActive ? 'text-primary' : 'text-primary/30 group-hover:text-primary/60'}`}>{world.type}</span>
      </div>
      {isActive && (
        <div className={`w-1.5 h-1.5 bg-white rounded-full animate-ping mr-2 shadow-[0_0_10px_white]`} style={{ backgroundColor: 'rgb(var(--color-primary))', opacity: `calc(0.5 + var(--audio-intensity, 0) * 0.5)` }} />
      )}
    </div>
  );
});

SimulationCard.displayName = 'SimulationCard';

export default function WrldChanger() {
  const activeTheme = useWorldStore(state => state.activeWorld);
  const setTheme = useWorldStore(state => state.setActiveWorld);
  const targetFrequency = useAudioStore(state => state.targetFrequency);
  const setTargetFrequency = useAudioStore(state => state.setTargetFrequency);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // PURGE SCROLL MEMORY ON BOOT
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  // GLOBAL COMMAND BINDS: ESC & ENT
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      } else if (e.key === 'Enter') {
        handleAccept();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isClosing]);

  const handleOpen = () => {
    if (isOpen || isSpinning) return;
    setIsSpinning(true);

    setTimeout(() => {
      setIsOpen(true);
    }, 20);

    setTimeout(() => {
      setIsSpinning(false);
    }, 250);
  };

  const handleCancel = () => {
    if (isClosing) return;
    setIsClosing(true);
    
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 400);
  };
  
  const handleAccept = () => {
    handleCancel();
  };

  const handleSelect = (id: string) => {
    setTheme(id);
    handleAccept(); // Launch visually then retract the hud
  };

  const activeWorld = WORLDS.find(w => w.id === activeTheme) || WORLDS[0];
  const ActiveIcon = activeWorld.icon;

  return (
    <>
      {/* TRIGGER GATEWAY */}
      <div
        className={`relative w-full h-full min-h-[52px] lg:min-h-[62px] flex flex-1 items-center justify-center px-4 lg:px-6 cursor-pointer pointer-events-auto transition-all duration-250 bg-black/40 backdrop-blur-md border-l border-solid border-[#00ffff]/20 hover:bg-[#00ffff]/10 hover:border-[#00ffff]/50 group ${isOpen && !isSpinning && !isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        onClick={handleOpen}
      >
        <div className="flex items-center gap-3">
            <span className="hidden lg:inline font-mono text-[9px] uppercase tracking-[0.4em] font-black italic text-primary/60 group-hover:text-primary transition-colors">WRLD_SIM</span>
            <div
              className={`relative transition-all duration-250 ${isSpinning ? 'animate-[pulse_0.1s_linear_infinite_ease-out]' : ''}`}
              style={{
                transform: `scale(calc(1.0 + (var(--audio-intensity, 0) * 0.05 * var(--reactivity-sensitivity, 1))))`,
              }}
            >
              <div className="text-primary/60 group-hover:text-primary transition-colors duration-300">
                <Globe className={`w-4 h-4 lg:w-5 lg:h-5 ${isSpinning ? 'animate-[spin_0.3s_linear_infinite]' : 'animate-[spin_10s_linear_infinite]'}`} />
              </div>
            </div>
        </div>
      </div>

      {/* OVERLAY HUD PORTAL TO BREAK FREE OF NAVBAR CONSTRAINTS */}
      {mounted && isOpen && createPortal(
        <div
          className={`fixed inset-0 z-[250000] backdrop-blur-md flex items-start justify-center p-2 pt-4 scanlines overflow-hidden transition-all duration-500 ${isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100 scale-100'}`}
          style={{ background: `radial-gradient(circle at 70% 50%, rgb(var(--color-primary) / 0.1) 0%, rgba(0,0,0,0.92) 80%), linear-gradient(135deg, rgba(0,0,0,0.85), rgba(0,0,0,0.96))` }}
        >
          {/* Ambient Glow */}
          <div className="fixed top-1/2 right-1/4 -translate-y-1/2 w-[70vw] h-[80vh] bg-primary rounded-full blur-[250px] opacity-10 pointer-events-none" />

          {/* Cinematic Container */}
          <div className="w-full h-full relative z-20 flex flex-col pt-0 md:pt-0 animate-in zoom-in-95 duration-700 px-2 md:px-4 pb-6">
            {/* CLOSE GLOBE TRIGGER */}
            <div 
                className="absolute top-[-12px] left-[-3px] md:top-[-16px] md:left-[1px] z-[300005] cursor-pointer pointer-events-auto"
                onClick={handleAccept}
            >
                {/* KINETIC LAYER 1: CINEMATIC TORQUE */}
                <div className={`relative origin-center ${isClosing ? 'animate-dock-reverse' : 'animate-dock-lock'}`}>
                  {/* KINETIC LAYER 2: NEURAL AUDIO PULSE */}
                  <div 
                      className="transition-transform duration-150"
                      style={{ transform: `scale(calc(1.0 + (var(--audio-intensity, 0) * 0.1 * var(--reactivity-sensitivity, 1))))` }}
                  >
                      <div className="text-white drop-shadow-[0_0_15px_rgb(var(--color-primary))]">
                          <Globe className="w-[49px] h-[49px] md:w-[65px] md:h-[65px] animate-[spin_3s_linear_infinite]" />
                      </div>
                  </div>
                </div>
            </div>

            {/* MAIN HUD CONTENT */}
            <div className="flex-1 flex flex-col cyber-panel border border-primary/40 shadow-[0_0_80px_rgb(var(--color-primary) / 0.15)] bg-black/40 overflow-hidden">
              <div
                ref={scrollContainerRef}
                className="flex-1 flex flex-col md:flex-row gap-0 overflow-y-auto md:overflow-hidden backdrop-blur-sm"
              >
                {/* LEFT COLUMN: SIMULATION LIBRARY */}
                <div className="w-full md:w-[40%] flex flex-col h-[50vh] md:h-full shrink-0 p-6 md:p-8 pt-10 md:pt-12 overflow-hidden bg-black/60 border-r border-primary/20 transition-all duration-700">
                  <div className="flex items-center justify-between border-b border-primary/20 pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-primary" />
                      <h2 className="text-xs font-mono tracking-[0.2em] text-primary uppercase cyber-flicker-slow">[ SIMULATION LIBRARY ]</h2>
                    </div>
                    <div className="px-2 py-0.5 bg-primary/20 text-primary text-[8px] font-mono tracking-widest flex items-center gap-1.5 animate-pulse">
                      <div className="w-1 h-1 bg-primary rounded-full" />
                      {WORLDS.length} READY
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-2" style={{ scrollbarWidth: 'thin' }}>
                    {WORLDS.map((world, i) => (
                       <SimulationCard 
                         key={world.id} 
                         world={world} 
                         isActive={activeTheme === world.id} 
                         i={i} 
                         handleSelect={handleSelect} 
                       />
                    ))}
                  </div>
                </div>

                {/* RIGHT COLUMN: COMMAND DECK */}
                <div className="w-full md:w-[60%] flex flex-col h-full shrink-0 p-8 md:p-12 relative overflow-hidden group bg-black/20 border-l border-white/5 transition-all duration-700 backdrop-blur-xl">
                  {/* Watermark Logo */}
                  <ActiveIcon
                    className={`absolute top-[10%] -right-10 w-[450px] h-[450px] text-primary/15 transition-all duration-[200ms] pointer-events-none drop-shadow-[0_0_100px_rgb(var(--color-primary) / 0.1)]`}
                    style={{
                      opacity: `calc(0.02 + var(--audio-intensity, 0) * 0.04 * var(--reactivity-sensitivity, 1))`,
                      transform: `scale(calc(1 + var(--audio-intensity, 0) * 0.03 * var(--reactivity-sensitivity, 1)))`
                    }}
                  />

                  <div className="flex flex-col relative z-10 flex-1">
                    <div className="inline-flex items-center gap-2 text-white bg-primary text-[10px] font-mono tracking-[0.4em] uppercase mb-6 px-4 py-1.5 border border-primary/50 w-max cyber-card shadow-[0_0_15px_rgb(var(--color-primary) / 0.6)]">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      ENVIRONMENT DIAGNOSTICS
                    </div>

                    <h1 className="text-6xl md:text-[100px] font-bebas tracking-widest uppercase leading-none mb-2 drop-shadow-[0_0_20px_rgb(var(--color-primary) / 0.8)] text-transparent bg-clip-text bg-gradient-to-br from-white via-primary to-primary/50">
                      {activeWorld.name}
                    </h1>

                    <p className="text-primary font-mono text-sm md:text-base font-bold tracking-[0.3em] uppercase mb-8 md:mb-12 border-l-4 border-primary pl-4 drop-shadow-[0_0_8px_rgb(var(--color-primary) / 0.5)]">
                      {activeWorld.desc}
                    </p>

                    {/* STATS GRID */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 mt-auto mb-8 md:mb-12">
                      <div className="cyber-card p-6 bg-black/80 border border-primary/40 backdrop-blur-sm shadow-[inset_0_0_20px_rgb(var(--color-primary) / 0.1)]">
                        <h3 className="text-[10px] font-mono text-gray-500 tracking-[0.3em] uppercase mb-4 border-b border-white/10 pb-2">SYSTEM TELEMETRY</h3>
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-center text-xs font-mono uppercase text-gray-400">
                            <span>Architecture</span>
                            <span className="text-primary font-bold">{activeWorld.core}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs font-mono uppercase text-gray-400">
                            <span>Latency</span>
                            <span className="text-white font-bold">{activeWorld.latency}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs font-mono uppercase text-gray-400">
                            <span>Threat Level</span>
                            <span className={`${activeWorld.type === 'HOSTILE' ? 'text-red-500' : 'text-green-500'} font-bold`}>{activeWorld.type}</span>
                          </div>
                        </div>
                      </div>

                      <div className="cyber-card p-6 bg-black/80 border border-primary/40 backdrop-blur-sm relative overflow-hidden flex flex-col justify-end shadow-[inset_0_0_20px_rgb(var(--color-primary) / 0.1)]">
                        <div className="absolute inset-x-0 bottom-0 bg-primary/20 pointer-events-none transition-all duration-75 mix-blend-screen" style={{ height: `calc(100% * var(--audio-intensity, 0))` }} />
                        <h3 className="text-[10px] font-mono text-primary/80 tracking-[0.3em] uppercase mb-4 border-b border-primary/20 pb-2 relative z-10">BOOT SEQUENCE LOG</h3>
                        <div className="flex flex-col gap-1 text-[9px] font-mono text-white/80 uppercase relative z-10">
                          <span>{'>'} INITIATING NEURAL HANDSHAKE...</span>
                          <span>{'>'} DECRYPTING {activeWorld.name} ASSETS...</span>
                          <span className="text-white font-black animate-pulse mt-1"><span className="text-primary">{'>'}</span> SIMULATION ENGAGED</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* COMMAND DECK FOOTER: FREQUENCY FILTERS & ACTIONS */}
                  <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 mt-auto pt-6 border-t border-primary/20 relative z-10 w-full">
                    <div className="flex-1 flex items-center gap-1 md:gap-2 w-full">
                      {['all', 'bass', 'mid', 'high'].map((freq) => (
                        <button
                          key={freq}
                          onClick={() => setTargetFrequency(freq as any)}
                          className={`flex-1 py-4 border transition-all duration-300 relative group overflow-hidden ${
                            targetFrequency === freq
                              ? 'bg-primary border-primary text-white font-black'
                              : 'bg-black/40 border-primary/20 text-white/40 font-mono hover:bg-black/60'
                          }`}
                        >
                          <div className={`absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity`} />
                          <span className="relative z-10 text-[10px] tracking-[0.4em] uppercase drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">
                            {freq}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                      <CyberButton onClick={handleCancel} text="ABORT" variant="danger" kbd="ESC" />
                      <CyberButton onClick={handleAccept} text="INITIALIZE" kbd="ENT" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
