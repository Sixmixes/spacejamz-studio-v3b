'use client';

import Link from 'next/link';
import { Sparkles, Video, UserPlus, Lock, Zap, Coins, Image as ImageIcon, AlertCircle, Loader2, Cpu, Terminal, CheckCircle2, Database, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { auth, discordProvider } from '@/lib/firebase/config';
import { signInWithPopup, signOut } from 'firebase/auth';
import { useUserStore } from '@/store/useUserStore';
import { CyberButton } from '@/components/ui/CyberButton';
import NeuralIdentityTerminal from '@/components/global/NeuralIdentityTerminal';
import { TelemetryNotificationModal } from '@/components/global/TelemetryNotificationModal';

export default function MatrixCore() {
    const { currentUser } = useUserStore();
    const [mounted, setMounted] = useState(false);
    const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
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
        <div className="relative h-full min-h-[500px] flex-1 w-full flex flex-col items-center justify-center overflow-hidden bg-black selection:bg-primary/30 group/main border-b border-primary/20">
            
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
                <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black z-10" />
            </div>

            <div className="relative z-20 flex flex-col items-center justify-center w-full animate-in fade-in zoom-in-95 duration-1000 mt-0">
                
                {/* NEURAL IDENTITY GATEWAY (Telemetry Overhaul & Telemetry Trigger) */}
                <div className="w-full mb-0 border-b-0 flex flex-col items-center">
                    <NeuralIdentityTerminal />
                    <button 
                        onClick={() => window.location.href='/pod'}
                        className="mt-6 text-[#00ffff] font-mono text-[9px] font-black tracking-[0.5em] px-10 py-3 border border-solid border-[#00ffff]/30 rounded-2xl bg-black/40 backdrop-blur-md hover:bg-[#00ffff]/10 hover:shadow-[0_0_20px_rgba(0,255,255,0.2)] transition-all uppercase"
                    >
                        [ VIEW ACTIVE NODE TELEMETRY ]
                    </button>
                </div>

                {/* 3D Retro Web Emulated Logo */}
                <div className="relative mb-0 group cursor-default scale-90 sm:scale-100">
                    <h1 className="text-5xl sm:text-7xl md:text-9xl lg:text-[10rem] font-black font-bebas tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-b from-white via-[#00ffff] to-[#00ffff]/50 drop-shadow-[0_10px_30px_rgba(0,255,255,0.4)] text-center relative z-10" 
                        style={{ lineHeight: '0.85', letterSpacing: '0.15em' }}>
                        SPACEJAMZ
                    </h1>
                    <div className="absolute -inset-4 bg-primary/20 blur-[100px] rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-1000 z-0" />
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[120%] h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                </div>
                
                <h2 className="text-[9px] sm:text-[10px] md:text-[11px] font-mono text-[#00ffff]/80 tracking-[0.3em] sm:tracking-[1.2em] uppercase mb-0 text-center cyber-flicker-slow px-10 relative z-20 bg-black/40 backdrop-blur-md py-2 border-y border-solid border-[#00ffff]/20 font-black italic w-full">
                    The Human Vanguard Architecture
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0 w-full relative group/grid">
                    {/* Grid Overlay Mask */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/grid:opacity-100 transition-opacity duration-700 pointer-events-none z-10" />
                    
                    {stargates.map((gate, i) => (
                        <Link 
                            key={gate.id} 
                            href={gate.href} 
                            className={`relative flex flex-col p-4 min-h-[160px] justify-between bg-black/40 backdrop-blur-3xl border border-[#00ffff]/20 hover:border-[#00ffff]/50 rounded-2xl hover:bg-black/60 transition-all duration-700 group/card overflow-hidden z-20 hover:z-30 hover:shadow-[0_0_40px_rgba(0,255,255,0.15)]`} 
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            {/* Cinematic Live Portrait Engine (Dynamic Seamless Loops) */}
                            <div className="absolute inset-0 z-0 opacity-10 group-hover/card:opacity-60 transition-opacity duration-1000">
                                <video 
                                    src={`/api/neural-assets?node=${gate.id}&pilot=${currentUser?.uid || 'anon'}`} 
                                    autoPlay 
                                    loop 
                                    muted 
                                    playsInline 
                                    className="w-full h-full object-cover grayscale brightness-50 mix-blend-screen scale-125 group-hover/card:scale-100 transition-transform duration-[3s]" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                            </div>

                            <div className="absolute rotate-45 -right-12 -top-12 w-32 h-32 lg:w-48 lg:h-48 bg-primary/5 group-hover/card:bg-primary/20 transition-all duration-700 blur-3xl z-10" />
                            
                            <div className="flex justify-between items-start mb-6 relative z-20">
                                <div className={`w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center border-2 border-primary/10 bg-black/80 rounded-none group-hover/card:scale-110 group-hover/card:border-primary/40 transition-all duration-500 ${gate.color} group-hover/card:shadow-[0_0_20px_rgba(var(--color-primary),0.4)]`}>
                                    <gate.icon size={18} className="lg:w-6 lg:h-6" />
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`text-[7px] lg:text-[8px] font-mono py-1 px-2 border border-primary/20 bg-black/80 tracking-[0.3em] font-black group-hover/card:border-primary/60 transition-colors ${gate.color} italic rounded-none`}>
                                        NODE_{gate.id}
                                    </span>
                                    <div className="w-4 h-[1px] bg-primary/20 group-hover/card:w-8 group-hover/card:bg-primary transition-all duration-700" />
                                </div>
                            </div>

                            <div className="relative z-20">
                                <h3 className="text-2xl lg:text-4xl font-black font-bebas tracking-[0.1em] text-primary/70 leading-none mb-2 group-hover/card:text-primary transition-colors italic uppercase">
                                    {gate.name.replace('[ ','').replace(' ]','')}
                                </h3>
                                <p className="text-[7px] lg:text-[9px] font-mono text-gray-500 tracking-[0.25em] uppercase leading-relaxed opacity-60 group-hover/card:opacity-100 transition-all duration-700 font-bold max-w-[160px]">
                                    {gate.desc}
                                </p>
                            </div>

                            <div className={`mt-6 text-[9px] lg:text-[11px] font-mono uppercase tracking-[0.4em] flex items-center gap-2 ${gate.color} opacity-0 group-hover/card:opacity-100 group-hover/card:translate-x-3 transition-all duration-500 font-black relative z-20 italic`}>
                                INITIATE NODE <ArrowRight size={14} className="animate-pulse" />
                            </div>
                            
                            {/* Scanning Border Animation */}
                            <div className="absolute top-0 right-0 w-1 h-0 bg-primary/40 group-hover/card:h-full transition-all duration-700" />
                        </Link>
                    ))}
                </div>
            </div>
            
            <div className="absolute bottom-6 left-10 flex items-center gap-4 z-[50]">
                <div className="w-2 h-2 rounded-none bg-primary animate-ping" />
                <div className="flex flex-col">
                    <span className="font-mono text-[7px] text-primary/30 uppercase tracking-[0.5em]">System_Status:</span>
                    <span className="font-mono text-[9px] text-primary uppercase font-black cyber-flicker-fast">Matrix Core Kernel Online</span>
                </div>
            </div>

            <div className="absolute bottom-6 right-10 font-mono text-[9px] text-primary/40 uppercase tracking-[0.3em] font-black z-[50]">
                Access_PT: ROOT_CORE_01
            </div>
        </div>
    );
}
