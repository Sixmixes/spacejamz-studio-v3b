'use client';

import Link from 'next/link';
import { Sparkles, Video, UserPlus, Lock, Zap, Coins, Image as ImageIcon, AlertCircle, Loader2, Cpu, Terminal, CheckCircle2, Database, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { auth, discordProvider } from '@/lib/firebase/config';
import { signInWithPopup, signOut } from 'firebase/auth';
import { useUserStore } from '@/store/useUserStore';
import { CyberButton } from '@/components/ui/CyberButton';
import NeuralIdentityTerminal from '@/components/global/NeuralIdentityTerminal';


export default function MatrixCore() {
    const { currentUser } = useUserStore();
    const [mounted, setMounted] = useState(false);

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
            
            {/* TACTICAL HUD WIDGETS (SIDES) */}
            <div className="absolute top-[200px] left-10 hidden xl:flex flex-col gap-8 z-[50] animate-in slide-in-from-left-8 duration-1000">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <Terminal size={14} className="text-primary animate-pulse" />
                        <span className="font-mono text-[10px] text-white uppercase tracking-[0.4em] font-black italic">Network_Live</span>
                    </div>
                    <div className="w-32 h-1 bg-primary/20 relative overflow-hidden">
                        <div className="absolute inset-y-0 left-0 w-1/3 bg-primary animate-slide-infinite" />
                    </div>
                    <span className="font-mono text-[8px] text-primary/40 uppercase tracking-widest font-bold italic">Packet_Loss: 0.00%</span>
                </div>
                <div className="bg-primary/5 border-l-4 border-primary p-4 space-y-3 backdrop-blur-md">
                    <span className="font-mono text-[7px] text-primary/40 uppercase tracking-[0.3em] font-black">System_Diagnostics:</span>
                    <div className="flex flex-col gap-1.5 font-mono text-[9px] text-white/60 tracking-widest uppercase">
                        <div className="flex justify-between items-center gap-4">
                            <span>GPU_Load</span>
                            <span className="text-primary font-black">42%</span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <span>Thread_Count</span>
                            <span className="text-primary font-black">128</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute top-[200px] right-10 hidden xl:flex flex-col gap-8 items-end z-[50] animate-in slide-in-from-right-8 duration-1000">
                <div className="bg-black/60 border-r-4 border-yellow-500 p-4 space-y-2 backdrop-blur-md text-right">
                    <div className="flex items-center justify-end gap-3 text-yellow-500 mb-1">
                        <span className="font-bebas text-2xl tracking-widest">Active nodes</span>
                        <Zap size={18} className="animate-pulse" />
                    </div>
                    <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest font-black">Sector_Foundry: ONLINE</span>
                </div>
                <div className="flex flex-col items-end gap-3">
                    <div className="flex gap-1.5">
                        {[...Array(5)].map((_, i) => <div key={i} className={`w-4 h-1.5 ${i < 4 ? 'bg-primary/40' : 'bg-primary/10'}`} />)}
                    </div>
                    <span className="font-mono text-[7px] text-primary/40 uppercase tracking-widest font-black">Treasury_Sync: 100%</span>
                </div>
            </div>

            {/* CSS Cinematic Space Background Layer (Fiery Upside-Down Firmament) */}
            <div className="absolute inset-0 z-0 flex items-start justify-center pointer-events-none opacity-90 mix-blend-color-dodge overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[120vw] h-[80vh] rounded-full bg-orange-600/20 blur-[200px] animate-pulse" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-10 w-[80vw] h-[60vh] rounded-[100%] bg-red-600/10 blur-[150px]" />
                <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[60vw] h-[40vh] rounded-full bg-yellow-500/5 blur-[100px]" />
                
                {/* CSS Planet Black Hole Base (Pushed Up) */}
                <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] rounded-[100%] shadow-[0_0_200px_rgba(255,100,0,0.15)] border-b-[2px] border-orange-500/40 bg-black/98 z-0">
                    <div className="absolute inset-0 rounded-full shadow-[inset_0_-40px_100px_rgba(255,50,0,0.2)]" />
                </div>
                
                {/* Horizon Line / Planetary Ring (Fiery) */}
                <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[1200px] sm:w-[1800px] h-[300px] sm:h-[500px] rounded-[100%] border-t-[3px] border-orange-500/30 opacity-60 z-10" style={{ filter: 'blur(4px)' }} />
            </div>

            <div className="relative z-20 flex flex-col items-center justify-center w-full animate-in fade-in zoom-in-95 duration-1000 mt-0">
                
                {/* NEURAL IDENTITY GATEWAY (Telemetry Overhaul) */}
                <div className="w-[calc(100%-40px)] xl:w-full mb-0 border-b-0">
                    <NeuralIdentityTerminal />
                </div>

                {/* 3D Retro Web Emulated Logo */}
                <div className="relative mb-0 group cursor-default scale-90 sm:scale-100">
                    <h1 className="text-5xl sm:text-7xl md:text-9xl lg:text-[10rem] font-black font-bebas tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-b from-[#00ffff] via-[#ff00ff] to-[#00ffff] drop-shadow-[0_10px_30px_rgba(255,0,255,0.8)] text-center relative z-10" 
                        style={{ WebkitTextStroke: '2px rgba(0,255,255,0.5)' }}>
                        SPACEJAMZ
                    </h1>
                    <div className="absolute -inset-4 bg-primary/20 blur-[100px] rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-1000 z-0" />
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[120%] h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                </div>
                
                <h2 className="text-[9px] sm:text-[10px] md:text-[11px] font-mono text-[#00ffff] tracking-[0.3em] sm:tracking-[1.2em] uppercase mb-0 text-center cyber-flicker-slow px-10 relative z-20 bg-black py-1 border-y border-dashed border-[#ff00ff]/60 font-black italic w-full">
                    The Human Vanguard Architecture
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0 w-full relative group/grid">
                    {/* Grid Overlay Mask */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/grid:opacity-100 transition-opacity duration-700 pointer-events-none z-10" />
                    
                    {stargates.map((gate, i) => (
                        <Link 
                            key={gate.id} 
                            href={gate.href} 
                            className={`relative flex flex-col p-4 min-h-[160px] justify-between bg-black border border-dashed border-[#ff00ff]/30 hover:border-[#00ffff] transition-all duration-700 group/card overflow-hidden z-20 hover:z-30 hover:shadow-[0_0_30px_#00ffff]`} 
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
