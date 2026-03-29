'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Database, Coins, Cpu, ShieldCheck, Globe, Sparkles, User, Terminal, Menu, X, ChevronRight } from 'lucide-react';

export default function NavigationHUD() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const links = [
        { name: 'Core', href: '/', icon: Globe },
        { name: 'Vault', href: '/vault', icon: Database },
        { name: 'Foundry', href: '/ai', icon: Sparkles },
        { name: 'Matrix', href: '/pod', icon: User },
        { name: 'Arena', href: '/studio', icon: Cpu },
        { name: 'Treasury', href: '/treasury', icon: Coins },
    ];

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-[10000] flex w-full animate-in fade-in duration-1000">
                 <div className="flex w-full items-center justify-between bg-black border-b border-primary/20 shadow-[0_15px_30px_rgba(0,0,0,0.9)] relative overflow-hidden group">
                    
                    {/* Tactical Scanline Effects */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(var(--color-primary),0.06),rgba(var(--color-primary),0.02),rgba(var(--color-primary),0.06))] z-10 bg-[length:100%_2px,3px_100%] animate-pulse" />
                    
                    {/* MOBILE HAMBURGER */}
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden flex items-center justify-center p-4 border-r border-primary/20 text-primary hover:bg-primary/10 transition-colors z-20"
                    >
                        {isOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    {/* Sector Identifier (Left) */}
                    <div className="hidden lg:flex items-center gap-3 px-5 py-2.5 border-r border-primary/20 bg-primary/5">
                        <Terminal size={12} className="text-primary animate-pulse" />
                        <span className="font-mono text-[8px] uppercase tracking-[0.4em] text-primary/60 font-black italic">Sys_SCTR: 001</span>
                    </div>

                    <div className="hidden lg:flex overflow-x-auto no-scrollbar py-0.5">
                        {links.map(link => {
                            const isActive = pathname === link.href;
                            const Icon = link.icon;
                            return (
                                <Link 
                                    key={link.href} 
                                    href={link.href}
                                    className={`flex items-center gap-2.5 px-5 py-3 transition-all relative z-20 group/item ${isActive ? 'bg-primary text-black' : 'bg-transparent text-white/40 hover:text-white hover:bg-white/5'}`}
                                >
                                    <Icon className={`w-3.5 h-3.5 transition-all duration-300 ${isActive ? 'text-black' : 'text-primary/40 group-hover/item:text-primary'}`} />
                                    <span className={`font-mono text-[9px] uppercase tracking-[0.25em] font-black whitespace-nowrap italic ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                                        {link.name}
                                    </span>
                                    {isActive && (
                                        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white opacity-40" />
                                    )}
                                </Link>
                            )
                        })}
                    </div>

                    {/* MOBILE LABEL */}
                    <div className="lg:hidden px-6 py-3 flex items-center gap-3 bg-primary/5 min-w-[140px] justify-center">
                        <Globe size={14} className="text-primary animate-spin-[8s]" />
                        <span className="font-bebas text-lg tracking-widest text-white italic">SPACEJAMZ</span>
                    </div>

                    {/* WRLD CHANGER TRIGGER (Modular Aesthetic Engine) */}
                    <div className="hidden lg:flex items-center gap-5 px-4 py-2 border-l border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all cursor-crosshair group/wrld relative overflow-hidden h-full">
                        <div className="absolute inset-y-0 left-0 w-[1px] bg-primary animate-pulse" />
                        <div className="flex flex-col items-end">
                            <span className="font-mono text-[6px] uppercase tracking-widest text-primary/30 leading-none mb-1 font-black underline group-hover/wrld:text-primary transition-colors">WRLD_ENG</span>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping shadow-[0_0_8px_rgba(var(--color-primary),0.6)]" />
                                <span className="font-mono text-[8px] uppercase tracking-widest text-primary font-bold leading-none">V3B</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Readout (Right) */}
                    <div className="hidden lg:flex items-center gap-5 px-5 py-2 border-l border-primary/20 bg-primary/5 h-full">
                        <div className="flex flex-col items-end">
                            <span className="font-mono text-[6px] uppercase tracking-widest text-primary/30 leading-none mb-1 font-black underline">Neural_Sync</span>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_green]" />
                                <span className="font-mono text-[8px] uppercase tracking-widest text-green-500 font-bold leading-none italic">ESTABLISHED</span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* MOBILE OVERLAY MENU */}
            <div className={`fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl transition-all duration-500 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none translate-x-full'}`}>
                <div className="flex flex-col h-full pt-28 px-10 gap-2">
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
