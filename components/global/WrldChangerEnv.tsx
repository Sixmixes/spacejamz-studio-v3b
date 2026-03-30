'use client';
import { useEffect } from 'react';
import { useWorldStore, WORLD_THEMES } from '@/store/useWorldStore';

export default function WrldChangerEnv() {
    const activeWorld = useWorldStore(state => state.activeWorld);
    const isGenerating = useWorldStore(state => state.isGenerating);
    const theme = WORLD_THEMES[activeWorld] || WORLD_THEMES.CYBERDECK_PRIME;

    useEffect(() => {
        const hex = theme.accent.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const rgbString = `${r} ${g} ${b}`; 

        // Physically overriding the Root CSS DOM ensures all instantiated React UI natively transitions
        document.documentElement.style.setProperty('--color-primary', rgbString);
        document.documentElement.style.setProperty('--color-accent', rgbString);
        document.documentElement.style.setProperty('--theme-accent-hex', theme.accent);
    }, [theme]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[-2] overflow-hidden bg-black">
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes cyberdeckScan {
                    0% { top: -10%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 110%; opacity: 0; }
                }
                @keyframes cyberdeckDataStream {
                    0% { background-position: 0% 0%; }
                    100% { background-position: 100% 100%; }
                }
                .animate-cyberdeck-scan { animation: cyberdeckScan 3s linear infinite; }
                .animate-cyberdeck-data-stream { animation: cyberdeckDataStream 20s linear infinite; }
            `}} />
            
            {/* Continuous Base Environment Engine */}
            <div 
                className="absolute inset-0 transition-all duration-[2000ms] ease-in-out opacity-80"
                style={{ background: theme.bgCss }}
            ></div>
            
            {/* WRLD CHANGER GENERATION OVERLAY */}
            {/* This layer sits below the music visualizer so intense music pulses OVERRIDE its visual dominance */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isGenerating ? 'opacity-100' : 'opacity-0'}`}>
                {/* Matrix/data flow effect */}
                <div 
                    className="absolute inset-0 opacity-40 mix-blend-color-dodge pointer-events-none"
                    style={{
                        backgroundImage: 'url(/noise.png)',
                        animation: 'cyberdeckDataStream 20s linear infinite',
                        filter: 'contrast(1.5) brightness(1.2)'
                    }}
                />
                {/* Horizontal Scanning laser line */}
                <div 
                    className="w-full h-3 absolute top-0 pointer-events-none blur-sm drop-shadow-2xl animate-cyberdeck-scan mix-blend-screen" 
                    style={{ backgroundColor: `rgb(var(--color-accent))`, boxShadow: `0 0 30px rgb(var(--color-accent))` }}
                />
                {/* Vignette pulsing overlay */}
                <div 
                    className="absolute inset-0 pointer-events-none animate-pulse mix-blend-multiply" 
                    style={{ boxShadow: `inset 0 0 150px rgb(var(--color-primary) / 0.4)` }}
                />
            </div>
            
            {/* Core Bass-Reactive Inner Phosphor Core (Overrides Generation Visually if Audio is loud enough) */}
            <div 
                className="absolute inset-0 mix-blend-screen pointer-events-none"
                style={{
                    background: `radial-gradient(circle at 50% 50%, rgb(var(--color-primary)) 0%, transparent 60%)`,
                    opacity: `calc(var(--audio-low, 0) * 0.4)`,
                    transform: `scale(calc(1 + var(--audio-intensity, 0) * 0.15))`
                }}
            ></div>
            
            {/* Snappy High/Mid Transient Edge Reactor */}
            <div 
                className="absolute inset-0 mix-blend-color-dodge pointer-events-none"
                style={{
                    boxShadow: `inset 0 0 150px rgb(var(--color-accent))`,
                    opacity: `calc(var(--audio-high, 0) * 0.6)`
                }}
            ></div>
            
            {/* Deep Static Texture */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 [mask-image:radial-gradient(ellipse_100%_100%_at_50%_50%,#000_20%,transparent_100%)]"></div>
        </div>
    );
}
