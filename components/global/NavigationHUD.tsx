'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Database, Coins, Cpu, ShieldCheck, Globe, Sparkles, User, Terminal, Menu, X, ChevronRight, Trophy } from 'lucide-react';
import WrldChanger from '@/components/global/WrldChanger';

export default function NavigationHUD() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    // Explicit Route Top-Alignment Vector (Bypasses Next.js Soft-Scroll Memory)
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [pathname]);

    const links = [
        { name: 'Core', href: '/', icon: Globe },
        { name: 'Vault', href: '/vault', icon: Database },
        { name: 'Foundry', href: '/ai', icon: Sparkles },
        { name: 'Matrix', href: '/pod', icon: User },
        { name: 'Arena', href: '/studio', icon: Cpu },
        { name: 'Treasury', href: '/treasury', icon: Coins },
        { name: 'Kings', href: '/leaderboard', icon: Trophy },
    ];

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-[10000] flex w-full animate-in fade-in duration-1000">
                 <div className="flex w-full items-center justify-between bg-black/40 backdrop-blur-xl border-b border-solid border-[#00ffff]/20 shadow-[0_4px_30px_rgba(0,255,255,0.05)] relative overflow-hidden group">
                    
                    {/* Tactical Scanline Effects */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(var(--color-primary),0.06),rgba(var(--color-primary),0.02),rgba(var(--color-primary),0.06))] z-10 bg-[length:100%_2px,3px_100%] animate-pulse" />
                    
                    {/* MOBILE LABEL (LEFT) */}
                    <Link href="/" className="lg:hidden px-4 sm:px-6 py-3 flex flex-shrink-0 items-center gap-2 sm:gap-3 bg-primary/5 min-w-[120px] justify-center border-r border-primary/20 hover:bg-primary/10 hover:shadow-[0_0_15px_rgba(var(--color-primary),0.2)] transition-all active:scale-95">
                        <Globe size={14} className="text-primary animate-spin-[8s]" />
                        <span className="font-bebas text-lg sm:text-xl tracking-widest text-white italic drop-shadow-[0_0_10px_rgba(var(--color-primary),0.8)]">SPACEJAMZ</span>
                    </Link>

                    {/* MOBILE TICKER NOTIFICATION DECK (CENTER) */}
                    <div className="lg:hidden flex-1 overflow-hidden relative h-full flex items-center bg-black/40" style={{ WebkitMaskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)' }}>
                         <style>{`
                            @keyframes rig-ticker {
                                0% { transform: translateX(100%); }
                                100% { transform: translateX(-150%); }
                            }
                            .animate-rig-ticker { animation: rig-ticker 12s linear infinite; }
                         `}</style>
                         <div className="flex items-center gap-8 whitespace-nowrap animate-rig-ticker font-mono text-[9px] text-primary/80 uppercase tracking-widest font-black italic cyber-flicker-slow w-full translate-y-[1px]">
                             <span className="flex items-center gap-2"><Sparkles size={10} className="text-white" /> AI FOUNDRY ONLINE</span>
                             <span className="flex items-center gap-2"><Globe size={10} className="text-white animate-spin-[4s]" /> ENTER THE ARENA</span>
                             <span className="flex items-center gap-2"><Coins size={10} className="text-white" /> TREASURY ESCROW ACTIVE</span>
                             <span className="flex items-center gap-2"><User size={10} className="text-white" /> SECURE COMMS LINKED</span>
                         </div>
                    </div>

                    {/* Sector Identifier (Left) */}
                    <div className="hidden lg:flex items-center gap-3 px-5 py-2.5 border-r border-solid border-[#00ffff]/20 bg-[#00ffff]/5">
                        <Terminal size={12} className="text-[#00ffff] animate-pulse" />
                        <span className="font-mono text-[8px] uppercase tracking-[0.4em] text-[#00ffff]/80 font-black italic shadow-none">Sys_SCTR: 001</span>
                    </div>

                    <div className="hidden lg:flex overflow-x-auto no-scrollbar items-center">
                        {links.map(link => {
                            const isActive = pathname === link.href;
                            const Icon = link.icon;
                            return (
                                <Link 
                                    key={link.href}
                                    href={link.href}
                                    className={`relative flex items-center gap-3 h-full px-8 py-[18px] border-r border-primary/20 transition-all duration-300 group overflow-hidden ${isActive ? 'bg-primary/5' : 'hover:bg-primary/5'}`}
                                >
                                    <div className={`absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300 ${isActive ? 'w-full shadow-[0_0_10px_rgba(var(--color-primary),0.8)]' : 'w-0 group-hover:w-full'}`} />
                                    
                                    <Icon size={12} className={`transition-colors duration-300 ${isActive ? 'text-primary drop-shadow-[0_0_8px_rgba(var(--color-primary),0.8)]' : 'text-primary/40 group-hover:text-primary'}`} />
                                    <span className={`font-mono text-[10px] uppercase tracking-[0.3em] font-black transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>
                                        {link.name}
                                    </span>
                                </Link>
                            )
                        })}
                    </div>

                    {/* MOBILE HAMBURGER (RIGHT) */}
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden flex items-center justify-center p-4 sm:p-5 border-l border-solid border-primary/20 text-primary hover:bg-primary/10 transition-colors z-20 bg-primary/5 flex-shrink-0"
                    >
                        {isOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    {/* WRLD CHANGER TRIGGER (Modular Aesthetic Engine) */}
                    <div className="hidden lg:flex h-full items-center justify-center">
                        <WrldChanger />
                    </div>

                    {/* Status Readout (Right) */}
                    <div className="hidden lg:flex items-center gap-5 px-5 py-2 border-l border-primary/20 bg-primary/5 h-full">
                        <div className="flex flex-col items-end">
                            <span className="font-mono text-[6px] uppercase tracking-widest text-primary/30 leading-none mb-1 font-black underline">Neural_Sync</span>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-[pulse_3s_ease-in-out_infinite] shadow-[0_0_12px_rgba(34,197,94,0.6)]" />
                                <span className="font-mono text-[8px] uppercase tracking-widest text-green-500 font-bold leading-none italic">ESTABLISHED</span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* MOBILE OVERLAY MENU */}
            <div className={`fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl transition-all duration-500 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none translate-x-full'}`}>
                <div className="flex flex-col h-full overflow-y-auto pt-28 pb-32 px-10 gap-2 scrollbar-none overscroll-contain">
                    <span className="font-mono text-[8px] text-primary/40 uppercase tracking-[0.8em] mb-10 font-bold italic border-b border-primary/20 pb-4">Main Navigation Sequence</span>
                    {links.map((link, i) => {
                        const isActive = pathname === link.href;
                        const Icon = link.icon;
                        return (
                            <Link 
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center justify-between p-6 border-b border-white/5 group transition-all duration-300 ${isActive ? 'bg-primary/10 border-primary/40' : 'hover:bg-white/5'}`}
                                style={{ transitionDelay: `${i * 50}ms` }}
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`p-4 rounded-sm border ${isActive ? 'border-primary bg-primary text-black' : 'border-white/10 text-primary/60 group-hover:border-primary group-hover:text-primary'}`}>
                                        <Icon size={24} />
                                    </div>
                                    <span className={`font-bebas text-4xl tracking-[0.1em] italic uppercase ${isActive ? 'text-primary' : 'text-white'}`}>{link.name}</span>
                                </div>
                                <ChevronRight className={`text-primary/20 group-hover:text-primary transition-all ${isActive ? 'translate-x-0' : '-translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                            </Link>
                        )
                    })}
                </div>
                {/* Mobile Decorative Matrix */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(circle_at_center,rgba(var(--color-primary),0.2)_0,transparent_100%)]" />
                <div className="absolute bottom-10 left-10 font-mono text-[10px] text-primary/20 uppercase tracking-[1em] font-black">MatrixCore_v3.0</div>
            </div>
        </>
    );
}
