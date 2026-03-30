'use client';
import { useState, useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { Code2, X, Maximize2, Minimize2, Edit2 } from 'lucide-react';
import CyberGlitchButton from '../ui/CyberGlitchButton';

export default function ArchitectEditor() {
    const { currentUser } = useUserStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [css, setCss] = useState(`/* SPACEJAMZ ARCHITECT ENGINE */
:root {
  /* You can tweak global primary colors here */
  /* --color-primary: 0, 255, 255; */
}

/* Inject global visual overrides */
.cyber-btn {
  /* example live edit */
}
`);

    // Only render for FOUNDER/admin
    const isArchitect = currentUser?.role === 'FOUNDER' || currentUser?.role === 'ADMIN';

    useEffect(() => {
        if (!isArchitect) return;
        
        let styleTag = document.getElementById('architect-live-css');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'architect-live-css';
            document.head.appendChild(styleTag);
        }
        
        styleTag.innerHTML = css;
    }, [css, isArchitect]);

    if (!isArchitect) return null;

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed top-24 right-4 z-[200] w-10 h-10 bg-black border border-primary/40 text-primary flex items-center justify-center hover:bg-primary hover:text-black transition-colors shadow-[0_0_15px_rgba(var(--color-primary),0.3)] group"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}
            >
                <Code2 size={16} />
                <span className="absolute right-12 px-2 py-1 bg-black text-primary border border-primary/30 font-mono text-[8px] uppercase tracking-widest opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">Live CSS</span>
            </button>
        );
    }

    return (
        <div className={`fixed z-[300] bg-[#050505] border-2 border-primary/30 shadow-[0_40px_100px_rgba(0,0,0,0.9)] flex flex-col transition-all duration-300 ${isExpanded ? 'inset-4 md:inset-10 lg:inset-20' : 'bottom-6 left-6 w-11/12 max-w-[450px] h-[500px]'}`}
             style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}
        >
            {/* Header */}
            <div className="bg-primary/10 border-b border-primary/20 p-3 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <Edit2 size={14} className="text-primary" />
                    <span className="font-mono text-[10px] text-primary tracking-[0.2em] uppercase font-black text-shadow-glow">Architect Live Engine</span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-primary/60 hover:text-primary transition-colors">
                        {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="text-primary/60 hover:text-red-500 transition-colors">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 relative p-2 bg-black/50 overflow-hidden">
                <textarea 
                    value={css}
                    onChange={(e) => setCss(e.target.value)}
                    spellCheck="false"
                    className="w-full h-full bg-transparent text-primary/80 font-mono text-[11px] leading-relaxed p-4 border border-white/5 focus:outline-none focus:border-primary/40 resize-none selection:bg-primary/30"
                    placeholder="/* Inject raw CSS into the Matrix... */"
                />
            </div>
            
            {/* Footer */}
            <div className="bg-primary/5 p-3 flex justify-between items-center border-t border-primary/20 shrink-0">
                <span className="font-mono text-[8px] text-primary/40 uppercase tracking-widest mt-1">Changes are live • Non-persistent</span>
                <CyberGlitchButton text="COPY CSS" className="py-1 px-4 text-[9px]" onClick={() => navigator.clipboard.writeText(css)} />
            </div>
        </div>
    );
}
