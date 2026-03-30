'use client';

import Link from 'next/link';
import { Sparkles, Video, UserPlus, Lock, Zap, Coins, Image as ImageIcon, AlertCircle, Loader2, Cpu, Terminal, CheckCircle2, Database, User, ShieldCheck, ArrowRight, Radio } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { coreAudioData } from '@/components/global/AudioEngine';
import { auth, discordProvider } from '@/lib/firebase/config';
import { signInWithPopup, signOut } from 'firebase/auth';
import { useUserStore } from '@/store/useUserStore';
import { CyberButton } from '@/components/ui/CyberButton';
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
                const bass = coreAudioData.current.low / 255; // 0 to 1 scaling factor

                // Aggressive spatial expansion based on heavy bass drops
                const globalScale = 1 + (bass * 0.1);
                const shadowRadius = bass * 120; // Massive bloom on hit
                const glowOpacity = bass * 0.9;

                // Directly mutate DOM pipeline (strictly overrides without crushing CSS wrapper)
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
        { name: "[ Escrow ]", id: "ESCROW", desc: "Inject Acapella DNA. S.U.N.C. Integration.", href: "/enrollment", icon: ShieldCheck, color: "text-purple-500" },
        { name: "[ Treasury ]", id: "FINANCE", desc: "Physical Dividends. Collect Dividends.", href: "/treasury", icon: Coins, color: "text-amber-500" }
    ];

    if (!mounted) return null;

    return (
        <div className="relative flex flex-1 w-full flex-col justify-start overflow-visible bg-transparent selection:bg-primary/30 group/main pt-0 pb-0 shrink-0">

            {/* CRT Persistent Filter Overlay */}
            <div className="absolute inset-0 pointer-events-none z-[40] opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(var(--color-primary),0.04),rgba(var(--color-primary),0.01),rgba(var(--color-primary),0.04))] bg-[length:100%_4px,4px_100%] animate-pulse" />
            <div className="absolute inset-0 pointer-events-none z-[40] bg-[radial-gradient(circle_at_center,rgba(var(--color-primary),0.08)_0,transparent_100%)] opacity-40 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />

            {/* NEW TELEMETRY MODAL ASSET */}
            <TelemetryNotificationModal isOpen={isTelemetryOpen} onClose={() => setIsTelemetryOpen(false)} />

            {/* CINEMATIC B-ROLL BACKGROUND LAYER */}
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <video
                    src={`/api/neural-assets?node=FINANCE&pilot=system`}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-30 mix-blend-screen scale-110 blur-sm"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10" />
            </div>

            <div className="relative z-20 flex flex-col justify-start w-full animate-in fade-in zoom-in-95 duration-1000 flex-1 pt-0 pb-0">

                {/* NEURAL IDENTITY GATEWAY DELEGATED TO PERSISTENT LAYOUT ENGINE */}

                {/* DYNAMIC SPATIAL VOLUME FOR CINEMATICS */}
                <div className="w-full relative flex flex-col items-center justify-start z-0">

                    {/* CURRENT SEASON INFO NODE - PAIRED LAYOUT MULTIPLEXER */}
                    <div className="w-full flex flex-col justify-start items-center pointer-events-none z-10 relative mt-0">

                        {/* Static Single-Phase B-Roll Typography */}
                        <div className="absolute inset-0 w-full flex justify-center items-center pointer-events-none z-0 blur-[4px] opacity-20">
                            <h1 ref={audioTextRef}
                                className="text-6xl sm:text-8xl md:text-[10rem] lg:text-[18rem] font-black text-primary text-center mix-blend-screen scale-y-75 transition-transform duration-75"
                                style={{ lineHeight: '0.85', letterSpacing: '0.15em' }}>
                                <ScrambleText text="SPACEJAMZ" scrambleSpeed={50} duration={750} syncToAudio={true} />
                            </h1>
                        </div>

                        {/* DASHBOARD CONTENT - Delayed Fade In */}
                        <div className={`w-full transition-all duration-[1500ms] delay-[1000ms] z-20 ${isBooted ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-[1.05] blur-md'}`}>
                            <div className="cyber-glitch-container w-full flex flex-col md:flex-row items-center justify-between border-y border-primary/20 bg-black/60 shadow-[0_0_50px_rgba(var(--color-primary),0.05)] backdrop-blur-md py-4 md:py-3 px-4 md:px-12 relative overflow-hidden">

                                {/* Decorative Trackers */}
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                                {/* LEFT FLANK: SEASON ZERO-BASE */}
                                {/* LEFT FLANK: SEASON ZERO-BASE */}
                                <div className="flex flex-col items-center justify-center shrink-0 py-4 md:py-2 md:h-auto min-h-[120px] w-full md:w-1/3 relative z-30 border-y md:border-y-0 border-x-0 md:border-r border-primary/20 md:pr-12 mt-2 md:mt-0 mb-2 md:mb-0">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-2 h-2 bg-primary rounded-none animate-pulse shadow-[0_0_10px_rgba(var(--color-primary),0.8)]" />
                                        <span className="font-mono text-[10px] tracking-[0.6em] text-primary uppercase font-black">Current Active Cycle</span>
                                    </div>

                                    <h2 className="font-bebas text-6xl md:text-7xl tracking-[0.1em] text-white italic drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] leading-none mb-2 text-center">
                                        <span className="cyber-glitch-text inline-block relative cursor-crosshair">SEASON</span> <span className="text-primary cyber-flicker-fast">01</span>
                                    </h2>
                                    <h3 className="font-mono text-[10px] text-gray-400 tracking-[0.5em] uppercase font-bold mb-4 italic outline-none flex items-center justify-center gap-4 text-center">
                                        THE HUMAN VANGUARD <span className="text-primary/40">{'//'}</span>
                                    </h3>

                                    <div className="flex items-center justify-center gap-6 w-full border-t border-primary/10 pt-3 flex-wrap">
                                        <div className="flex flex-col items-center">
                                            <span className="font-mono text-[8px] text-gray-500 tracking-[0.4em] uppercase mb-1.5">Stem Drops</span>
                                            <span className="font-mono text-[11px] text-primary tracking-widest font-black italic cyber-flicker-slow shadow-primary drop-shadow-[0_0_10px_rgba(var(--color-primary),0.5)]">ACTIVE</span>
                                        </div>
                                        <div className="w-[1px] h-6 bg-primary/20" />
                                        <div className="flex flex-col items-center">
                                            <span className="font-mono text-[8px] text-gray-500 tracking-[0.4em] uppercase mb-1.5">Architect</span>
                                            <span className="font-mono text-[11px] text-white tracking-widest font-black italic uppercase">Tracking</span>
                                        </div>
                                    </div>
                                </div>

                                {/* CENTER COLUMN: LATEST COSMETICS DROP MAPPING */}
                                <div className="hidden md:flex flex-1 flex-col px-8 h-[160px] items-start justify-center">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                                        <h4 className="font-mono text-[9px] text-gray-400 tracking-[0.3em] uppercase font-bold">Latest Treasury Drops</h4>
                                    </div>
                                    <div className="w-full space-y-2 max-w-sm">
                                        <div className="flex justify-between items-center text-[10px] font-mono w-full bg-primary/5 px-2 py-1 border-l border-primary">
                                            <span className="text-white">ABYSSAL Matrix</span>
                                            <span className="text-primary/60 italic">AVAILABLE</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-mono w-full bg-primary/5 px-2 py-1 border-l border-primary/40">
                                            <span className="text-gray-400">NEON_DOJO Overdrive</span>
                                            <span className="text-yellow-500 italic">SECURE</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-mono w-full bg-primary/5 px-2 py-1 border-l border-primary/20">
                                            <span className="text-gray-500 line-through">SECTOR_7 Syndicate</span>
                                            <span className="text-red-500/50 italic">SOLD OUT</span>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT FLANK: TACTICAL BROADCAST METRICS */}
                                <div className="hidden md:flex flex-1 flex-col border-l border-primary/20 pl-8 h-[160px] items-stretch justify-start">
                                    <div className="flex items-center justify-end gap-2 mb-3 w-full">
                                        <Radio className="w-4 h-4 text-red-500" />
                                        <h4 className="font-mono text-[9px] text-gray-400 tracking-[0.3em] uppercase font-bold text-right pt-0.5">Live Broadcast Uplink</h4>
                                    </div>

                                    <div className="w-full flex-1 border border-red-500/30 bg-black/40 relative flex items-center justify-center group overflow-hidden shadow-[0_0_15px_rgba(239,68,68,0.05)] pointer-events-auto cursor-pointer hover:border-red-500/80 transition-colors">
                                        <div className="absolute top-1.5 left-2 flex items-center gap-1.5 z-10">
                                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(239,68,68,1)]" />
                                            <span className="font-mono text-[7px] text-white tracking-widest uppercase bg-red-500/80 px-1 rounded-sm font-bold shadow-sm">HQ</span>
                                        </div>
                                        <div className="absolute inset-0 bg-red-500/5 opacity-50 group-hover:opacity-100 transition-opacity" />

                                        <div className="absolute inset-0 pointer-events-none z-[40] opacity-[0.25] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%),linear-gradient(90deg,rgba(239,68,68,0.08),rgba(239,68,68,0.02),rgba(239,68,68,0.08))] bg-[length:100%_4px,4px_100%] animate-[cyber-glitch-container-anim_10s_infinite]" />

                                        <span className="font-bebas text-2xl md:text-3xl text-white/30 tracking-[0.2em] relative z-10 group-hover:text-red-500 transition-colors drop-shadow-md">STANDBY</span>

                                        {/* Bracket Corners */}
                                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-500/60" />
                                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-red-500/60" />
                                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-red-500/60" />
                                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-500/60" />
                                    </div>

                                    <div className="w-full flex justify-between mt-2 font-mono text-[7px] text-gray-500 uppercase tracking-[0.3em] font-bold">
                                        <span className="text-primary/60 drop-shadow-[0_0_5px_rgba(var(--color-primary),0.8)] cyber-flicker-slow">V: --</span>
                                        <span>ENCRYPTED_STREAM</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* VANGUARD CLUSTER */}
                <div className="w-full flex flex-col relative z-20 mt-0">
                    <div className="flex flex-col md:flex-row justify-between items-center w-full px-4 md:px-10 bg-black/40 backdrop-blur-md py-3 border-y border-solid border-[#00ffff]/20 gap-4 md:gap-0">
                        {/* System Status Left */}
                        <div className="flex items-center gap-4 hidden md:flex">
                            <div className="w-2 h-2 rounded-none bg-primary animate-ping" />
                            <div className="flex flex-col">
                                <span className="font-mono text-[7px] text-primary/30 uppercase tracking-[0.5em]">System_Status:</span>
                                <span className="font-mono text-[9px] text-primary uppercase font-black cyber-flicker-fast">Matrix Core Kernel Online</span>
                            </div>
                        </div>

                        {/* Title Center */}
                        <h2 className="text-[9px] sm:text-[10px] md:text-[11px] font-mono text-[#00ffff]/80 tracking-[0.3em] sm:tracking-[1.2em] uppercase mb-0 text-center cyber-flicker-slow font-black italic">
                            The Human Vanguard Architecture
                        </h2>

                        {/* Access Point Right */}
                        <div className="font-mono text-[9px] text-primary/40 uppercase tracking-[0.3em] font-black hidden md:block">
                            Access_PT: ROOT_CORE_01
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0 w-full relative group/grid z-30 border-y border-t-primary/20 border-b-white/20">
                        {/* Grid Overlay Mask */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/grid:opacity-100 transition-opacity duration-700 pointer-events-none z-10" />

                        {stargates.map((gate, i) => (
                            <Link
                                key={gate.id}
                                href={gate.href}
                                className={`relative flex flex-col p-5 md:p-8 min-h-[200px] md:min-h-[240px] justify-between bg-black/40 md:bg-black/60 backdrop-blur-md md:backdrop-blur-3xl border-b border-r border-[#1a1a1a] hover:border-primary/50 hover:bg-black/80 transition-all duration-700 group/card overflow-hidden z-20 hover:z-30 hover:shadow-[0_0_60px_rgba(var(--color-primary),0.15)]`}
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                {/* Cinematic Live Portrait Engine (Dynamic Seamless Loops) */}
                                <div className="absolute inset-0 z-0 opacity-10 group-hover/card:opacity-40 transition-opacity duration-1000">
                                    <video
                                        src={`/api/neural-assets?node=${gate.id}&pilot=${currentUser?.uid || 'anon'}`}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover grayscale brightness-50 mix-blend-screen scale-125 group-hover/card:scale-100 transition-transform duration-[3s]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                </div>

                                <div className="absolute rotate-45 -right-12 -top-12 w-32 h-32 lg:w-48 lg:h-48 bg-primary/5 group-hover/card:bg-primary/20 transition-all duration-700 blur-3xl z-10" />

                                {/* Holographic Hex/Grid Overlay on Hover */}
                                <div className="absolute inset-0 pointer-events-none z-[15] opacity-0 group-hover/card:opacity-10 transition-opacity duration-700 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%),linear-gradient(90deg,rgba(var(--color-primary),0.1),rgba(var(--color-primary),0.02),rgba(var(--color-primary),0.1))] bg-[length:100%_4px,4px_100%] mix-blend-screen" />

                                <div className="flex justify-between items-start mb-6 relative z-20">
                                    <div className={`w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center border-2 border-primary/10 bg-black/80 rounded-none group-hover/card:scale-110 group-hover/card:border-primary/40 transition-all duration-500 ${gate.color} group-hover/card:shadow-[0_0_30px_rgba(var(--color-primary),0.6)]`}>
                                        <gate.icon size={18} className="lg:w-6 lg:h-6" />
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`text-[7px] lg:text-[8px] font-mono py-1 px-2 border border-primary/20 bg-black/80 tracking-[0.3em] font-black group-hover/card:border-primary/60 transition-colors ${gate.color} italic rounded-none`}>
                                            NODE_{gate.id}
                                        </span>
                                        <div className="w-4 h-[1px] bg-primary/20 group-hover/card:w-8 group-hover/card:bg-primary transition-all duration-700" />
                                    </div>
                                </div>

                                <div className="relative z-20 flex flex-col mt-auto group/text z-[25]">
                                    <div className={`mb-3 text-[9px] lg:text-[11px] font-mono uppercase tracking-[0.4em] flex items-center gap-2 ${gate.color} opacity-0 group-hover/card:opacity-100 group-hover/card:translate-x-3 transition-all duration-500 font-black relative italic`}>
                                        INITIATE NODE <ArrowRight size={14} className="animate-pulse" />
                                    </div>
                                    <h3 className="text-2xl lg:text-3xl font-black font-bebas tracking-[0.1em] text-white/90 leading-none mb-3 group-hover/card:text-primary transition-colors italic uppercase">
                                        {gate.name.replace('[ ', '').replace(' ]', '')}
                                    </h3>
                                    <p className="font-mono text-[9px] uppercase tracking-widest leading-relaxed text-gray-500 group-hover/card:text-gray-300 transition-colors">
                                        {gate.desc}
                                    </p>
                                </div>

                                {/* Scanning Border Animation */}
                                <div className="absolute top-0 right-0 w-1 h-0 bg-primary/40 group-hover/card:h-full transition-all duration-700" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
