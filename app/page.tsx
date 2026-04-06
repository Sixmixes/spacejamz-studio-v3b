'use client';

import Link from 'next/link';
import { Sparkles, Cpu, Database, User, ArrowRight, Radio, Activity, Coins } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { coreAudioData } from '@/components/global/AudioEngine';
import { useUserStore } from '@/store/useUserStore';
import { TelemetryNotificationModal } from '@/components/global/TelemetryNotificationModal';
import { ScrambleText } from '@/components/ui/ScrambleText';

export default function MatrixCore() {
    const { currentUser } = useUserStore();
    const [mounted, setMounted] = useState(false);
    const [isBooted, setIsBooted] = useState(false);
    const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        const timer = setTimeout(() => setIsBooted(true), 1200);
        return () => clearTimeout(timer);
    }, []);

    const audioTextRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        let rafId: number;
        const renderLoop = () => {
            if (audioTextRef.current) {
                const bass = coreAudioData.current.low / 255;
                const globalScale = 1 + (bass * 0.1);
                const shadowRadius = bass * 120;
                const glowOpacity = bass * 0.9;
                audioTextRef.current.style.transform = `scale(1, 0.75) scale(${globalScale})`;
                audioTextRef.current.style.filter = `drop-shadow(0px 0px ${shadowRadius}px rgba(var(--color-primary), ${glowOpacity}))`;
            }
            rafId = requestAnimationFrame(renderLoop);
        };
        rafId = requestAnimationFrame(renderLoop);
        return () => cancelAnimationFrame(rafId);
    }, []);

    const stargates = [
        { name: "[ Neural Vault ]", id: "VAULT", desc: "Encrypted timeline audio matrix. Add Lyrics & Beat ingestion.", href: "/vault", icon: Database, color: "text-primary" },
        { name: "[ AI ]", id: "NEURAL", desc: "GPU Art & Video synthesis. Take photos & enhance prompts.", href: "/ai", icon: Sparkles, color: "text-cyan-400" },
        { name: "[ Pod ]", id: "POD", desc: "Your personal stats vault. Identity & Streamer tools.", href: "/pod", icon: User, color: "text-green-500" },
        { name: "[ Arena ]", id: "STUDIO", desc: "Competitive AI producers. Lock co-labs & Beat ingestion.", href: "/studio", icon: Cpu, color: "text-blue-500" },
        { name: "[ SyncSpace ]", id: "SYNCSPACE", desc: "Global Synchronization Suite. Active Placement Feed.", href: "/syncspace", icon: Activity, color: "text-purple-500" },
        { name: "[ Treasury ]", id: "FINANCE", desc: "Physical Dividends. Collect Dividends.", href: "/treasury", icon: Coins, color: "text-amber-500" }
    ];

    if (!mounted) return null;

    return (
        <div className="w-full flex-1 flex flex-col relative bg-transparent overflow-hidden selection:bg-primary/30 group/main -mb-[88px] sm:-mb-[80px]">
            
            {/* DYNAMIC BACKGROUND EFFECTS */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <video
                    src={`/api/neural-assets?node=FINANCE&pilot=system`}
                    autoPlay loop muted playsInline
                    className="w-full h-full object-cover opacity-[0.15] mix-blend-screen scale-110 blur-sm"
                />
                {/* CRT Pulse Effect Overlay */}
                <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(var(--color-primary),0.04),rgba(var(--color-primary),0.01),rgba(var(--color-primary),0.04))] bg-[length:100%_4px,4px_100%] animate-pulse" />
            </div>

            <TelemetryNotificationModal isOpen={isTelemetryOpen} onClose={() => setIsTelemetryOpen(false)} />

            {/* --------------------------------------------------------
                INTERFACE LAYER: RIGID, FLUSH, STRETCHING ARCHITECTURE
                -------------------------------------------------------- */}
            <div className={`relative z-20 w-full h-full flex-1 flex flex-col transition-all duration-1000 ${isBooted ? 'opacity-100' : 'opacity-0'}`}>
                
                {/* TOP COMPONENT: TACTICAL DASHBOARD - DOCKS TO PROFILE BANNER */}
                <div className="w-full shrink-0 flex flex-col md:flex-row items-stretch border-b border-primary/30 bg-black/60 shadow-[0_10px_50px_rgba(var(--color-primary),0.05)] relative overflow-hidden backdrop-blur-3xl min-h-[140px]">
                    
                    {/* Background "SPACEJAMZ" text anchored strictly within dashboard to avoid loose layout blocks */}
                    <div className="absolute inset-0 z-0 flex justify-center items-center blur-[3px] opacity-10 pointer-events-none overflow-hidden">
                        <h1 ref={audioTextRef}
                            className="text-[12rem] lg:text-[22rem] font-black text-primary text-center mix-blend-screen scale-y-75 uppercase"
                            style={{ lineHeight: '0.85', letterSpacing: '0.15em' }}>
                            <ScrambleText text="SPACEJAMZ" scrambleSpeed={50} duration={750} syncToAudio={true} />
                        </h1>
                    </div>

                    {/* LEFT: SEASON METRICS */}
                    <div className="flex-1 flex flex-col justify-center items-center py-6 px-4 border-b md:border-b-0 md:border-r border-primary/20 relative z-10 w-full overflow-hidden">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--color-primary),0.8)]" />
                            <span className="font-mono text-[10px] tracking-[0.6em] text-primary uppercase font-black">Current Active Cycle</span>
                        </div>
                        <h2 className="font-bebas text-6xl lg:text-7xl tracking-[0.1em] text-white italic drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] leading-none mb-1 text-center">
                            SEASON <span className="text-primary cyber-flicker-fast">01</span>
                        </h2>
                        <h3 className="font-mono text-[10px] text-gray-400 tracking-[0.5em] uppercase font-bold mb-4 italic flex gap-4">
                            THE HUMAN VANGUARD <span className="text-primary/40">{'//'}</span>
                        </h3>
                        <div className="flex items-center gap-6 border-t border-primary/20 pt-4 px-6 w-full max-w-sm justify-between">
                            <div className="flex flex-col items-center">
                                <span className="font-mono text-[9px] text-gray-500 tracking-[0.4em] uppercase mb-1">Stem Drops</span>
                                <span className="font-mono text-[11px] text-primary tracking-widest font-black italic shadow-primary drop-shadow-[0_0_5px_rgba(var(--color-primary),0.5)]">ACTIVE</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="font-mono text-[9px] text-gray-500 tracking-[0.4em] uppercase mb-1">Architect</span>
                                <span className="font-mono text-[11px] text-white tracking-widest font-black italic uppercase">Tracking</span>
                            </div>
                        </div>
                    </div>

                    {/* MIDDLE: TREASURY DROPS */}
                    <div className="flex-1 flex flex-col justify-center py-6 px-8 border-b md:border-b-0 md:border-r border-primary/20 relative z-10 bg-black/40 xl:bg-transparent">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <h4 className="font-mono text-[9px] text-gray-400 tracking-[0.3em] uppercase font-bold">Latest Treasury Drops</h4>
                        </div>
                        <div className="flex flex-col gap-2 w-full max-w-[300px]">
                            <div className="flex justify-between items-center text-[10px] font-mono bg-primary/10 px-3 py-1 border-l-2 border-primary">
                                <span className="text-white">ABYSSAL Matrix</span>
                                <span className="text-primary/60 italic font-black">AVAILABLE</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-mono bg-primary/5 px-3 py-1 border-l-2 border-yellow-500/50">
                                <span className="text-gray-400">NEON_DOJO Overdrive</span>
                                <span className="text-yellow-500 italic font-black">SECURE</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-mono bg-black/40 px-3 py-1 border-l-2 border-red-500/20">
                                <span className="text-gray-600 line-through">SECTOR_7 Syndicate</span>
                                <span className="text-red-500/40 italic font-black">SOLD OUT</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: BROADCAST UPLINK */}
                    <div className="flex-1 flex flex-col justify-center py-6 px-8 relative z-10 bg-black/40 xl:bg-transparent">
                        <div className="flex items-center justify-end gap-2 mb-4 w-full">
                            <Radio className="w-4 h-4 text-red-500" />
                            <h4 className="font-mono text-[9px] text-gray-400 tracking-[0.3em] uppercase font-bold text-right pt-0.5">Live Broadcast Uplink</h4>
                        </div>
                        <div className="w-full flex-1 border border-red-500/30 bg-black/60 relative flex items-center justify-center min-h-[80px] group cursor-pointer hover:border-red-500 transition-colors shadow-[inset_0_0_20px_rgba(239,68,68,0.05)] hover:shadow-[inset_0_0_20px_rgba(239,68,68,0.2)]">
                            <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                <span className="font-mono text-[7px] text-white tracking-widest uppercase bg-red-500/80 px-1 font-bold">HQ</span>
                            </div>
                            <span className="font-bebas text-3xl md:text-4xl text-red-500/60 tracking-[0.2em] relative z-10 group-hover:text-red-500 transition-colors drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">STANDBY</span>
                        </div>
                        <div className="w-full flex justify-between mt-3 font-mono text-[8px] text-gray-500 uppercase tracking-[0.3em] font-bold">
                            <span className="text-primary/60 cyber-flicker-slow">V: --</span>
                            <span>ENCRYPTED_STREAM</span>
                        </div>
                    </div>
                </div>

                {/* BOTTOM COMPONENT: VANGUARD CLUSTER - DYNAMICALLY STRETCHES DOWN */}
                <div className="w-full flex-1 flex flex-col z-30">
                    <div className="w-full bg-black/80 shadow-inner py-3 px-6 border-b border-[#00ffff]/20 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 bg-primary animate-ping" />
                            <span className="font-mono text-[9px] text-primary uppercase font-black tracking-[0.5em] hidden sm:inline">Matrix Core Kernel Online</span>
                            <span className="font-mono text-[9px] text-primary uppercase font-black tracking-[0.5em] sm:hidden">Online</span>
                        </div>
                        <h2 className="text-[10px] lg:text-[11px] font-mono text-[#00ffff]/80 tracking-[0.5em] lg:tracking-[1.2em] uppercase text-center font-black italic">
                            The Human Vanguard Architecture
                        </h2>
                        <div className="hidden md:block font-mono text-[9px] text-primary/40 uppercase tracking-[0.5em] font-black">
                            Access_PT: ROOT_CORE_01
                        </div>
                    </div>

                    {/* VANGUARD CARDS GRID - AUTO ROWS FILL REMAINING SPACE */}
                    <div className="w-full flex-1 grid grid-cols-2 lg:grid-cols-6 auto-rows-fr bg-[#050505]">
                        {stargates.map((gate) => (
                            <Link
                                key={gate.id}
                                href={gate.href}
                                className="group relative flex flex-col p-6 pb-[calc(1.5rem+88px)] sm:pb-[calc(1.5rem+80px)] h-full justify-between border-r border-[#1a1a1a] hover:bg-black transition-all duration-500 overflow-hidden"
                            >
                                {/* Background Video Layer */}
                                <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-40 transition-opacity duration-1000">
                                    <video src={`/api/neural-assets?node=${gate.id}&pilot=${currentUser?.uid || 'anon'}`} autoPlay loop muted playsInline className="w-full h-full object-cover grayscale brightness-50 mix-blend-screen scale-110 group-hover:scale-100 transition-transform duration-1000" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                </div>
                                <div className="absolute rotate-45 -right-12 -top-12 w-48 h-48 bg-primary/5 group-hover:bg-primary/20 transition-all duration-700 blur-3xl z-10 pointer-events-none" />

                                <div className="relative z-20 flex flex-col h-full items-start">
                                    <div className="flex justify-between items-start w-full mb-4">
                                        <div className={`w-12 h-12 flex items-center justify-center border-2 border-primary/20 bg-black/90 group-hover:border-primary/60 transition-colors duration-500 ${gate.color} shadow-lg shrink-0`}>
                                            <gate.icon className="w-6 h-6" />
                                        </div>
                                        <span className={`text-[8px] font-mono py-1 px-2 border border-primary/30 bg-black/90 tracking-[0.3em] font-black ${gate.color} italic hidden sm:block`}>
                                            NODE_{gate.id}
                                        </span>
                                    </div>

                                    <div className="mt-auto pt-8 flex flex-col w-full z-30">
                                        <div className={`text-[10px] font-mono uppercase tracking-[0.4em] flex items-center gap-2 ${gate.color} opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 font-black italic mb-2`}>
                                            INITIATE <ArrowRight size={12} className="opacity-70 animate-pulse" />
                                        </div>
                                        <h3 className="text-3xl xl:text-4xl font-black font-bebas tracking-[0.1em] text-white/90 leading-none mb-2 group-hover:text-primary transition-colors italic uppercase line-clamp-1">
                                            {gate.name.replace('[ ', '').replace(' ]', '')}
                                        </h3>
                                        <p className="font-mono text-[9px] uppercase tracking-widest leading-relaxed text-gray-500 group-hover:text-gray-300 transition-colors line-clamp-3">
                                            {gate.desc}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Hover interactive border */}
                                <div className="absolute top-0 right-0 w-1 h-0 bg-primary/40 group-hover:h-full transition-all duration-500 z-50 mix-blend-screen" />
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
