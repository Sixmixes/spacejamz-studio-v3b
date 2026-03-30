'use client';
import { useState } from 'react';
import { Plus, LayoutDashboard, Orbit, Zap, ShieldAlert, Radio } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';

export default function GlobalActionFab() {
    const { currentUser } = useUserStore();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    
    // Global FAB requires authentication
    if (!currentUser) return null;

    const actions = [
        { icon: <Zap size={18} />, label: 'AI Foundry', path: '/ai' },
        { icon: <LayoutDashboard size={18} />, label: 'Identity Pod', path: '/pod' },
        { icon: <Orbit size={18} />, label: 'Treasury', path: '/treasury' },
        { icon: <Radio size={18} />, label: 'Studio Nexus', path: '/studio' }
    ];

    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-center justify-end">
            {/* Action Tier List */}
            <div className={`flex flex-col gap-4 mb-6 transition-all duration-300 origin-bottom ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-20 pointer-events-none'}`}>
                {actions.map((act, i) => (
                    <button
                        key={act.path}
                        onClick={() => {
                            setIsOpen(false);
                            router.push(act.path);
                        }}
                        className="group relative flex items-center justify-center w-12 h-12 bg-[#050505] border border-primary/30 text-primary transition-all duration-300 hover:border-primary hover:bg-primary hover:text-black hover:scale-110 shadow-[0_0_15px_rgba(0,0,0,0.8)]"
                        style={{ 
                            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                            transitionDelay: isOpen ? `${(actions.length - i) * 60}ms` : '0ms' 
                        }}
                    >
                        {act.icon}
                        
                        {/* Hover Tooltip - Left Side */}
                        <div className="absolute right-16 px-3 py-1.5 bg-black/90 backdrop-blur-md border-r-2 border-primary font-mono text-[10px] uppercase tracking-[0.2em] text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 pointer-events-none whitespace-nowrap shadow-[0_0_10px_rgba(var(--color-primary),0.3)] flex items-center gap-2">
                            <span>{act.label}</span>
                            <div className="w-1 h-1 bg-primary rounded-full animate-ping" />
                        </div>
                    </button>
                ))}
            </div>

            {/* Core Tactical Anchor */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 flex items-center justify-center bg-primary text-black shadow-[0_0_40px_rgba(var(--color-primary),0.4)] hover:shadow-[0_0_60px_rgba(var(--color-primary),0.7)] hover:bg-white transition-all duration-500 z-10 ${isOpen ? 'rotate-[135deg] scale-90 bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)] border-red-500 text-white' : 'rotate-0 bg-primary border-primary'}`}
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
            >
                {/* Inner decorative hexagon */}
                <div className={`absolute inset-1 border border-black/30 transition-all duration-500 ${isOpen ? 'scale-125 border-white/50 opacity-0' : 'scale-100 opacity-100'}`} style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
                
                <Plus size={32} className={`relative z-10 drop-shadow-[0_0_5px_rgba(0,0,0,0.5)] transition-transform duration-500 ${isOpen ? 'rotate-180 scale-125' : 'scale-100'}`} />
            </button>
        </div>
    );
}
