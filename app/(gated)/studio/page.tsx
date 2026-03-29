'use client';
import { useState } from 'react';
import { Image as ImageIcon, Zap, Activity, ShieldAlert, Download } from 'lucide-react';
import { CyberButton } from '@/components/ui/CyberButton';
import NeuralIdentityTerminal from '@/components/global/NeuralIdentityTerminal';

interface ArtNode {
    id: string;
    url: string;
    promptText: string;
}

export default function VelocityArtFoundry() {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [coverArts, setCoverArts] = useState<ArtNode[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const triggerFluxSynthesis = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        setErrorMsg(null);

        try {
            const res = await fetch('/api/studio/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Generative Handshake Failed.');
            }

            const newArt: ArtNode = {
                id: crypto.randomUUID(),
                url: data.url,
                promptText: prompt
            };

            // Push the new 1024x1024 visual block to the gallery stack
            setCoverArts(prev => [newArt, ...prev]);
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-screen pb-24 relative overflow-hidden bg-black text-white p-4 pt-20">
            <div className="w-full max-w-6xl z-[60] mb-8">
                <NeuralIdentityTerminal />
            </div>
            {/* FLUX TERMINAL */}
            <div className="cyber-panel p-6 md:p-12 w-full max-w-6xl z-50">
                
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-10 border-b border-primary/20 pb-4">
                    <div className="flex items-center gap-3">
                        <ImageIcon className="text-primary w-8 h-8 animate-pulse" />
                        <div>
                            <h1 className="text-3xl font-black tracking-[0.2em] font-mono uppercase text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-500">
                                Album Art Foundry
                            </h1>
                            <p className="text-[10px] font-mono tracking-widest text-cyan-500 uppercase mt-1">
                                Powered by Base FLUX [SCHNELL] // Core Inference Limit: $0.003
                            </p>
                        </div>
                    </div>
                    <span className="text-[10px] font-mono tracking-widest bg-cyan-500/20 text-cyan-500 px-3 py-1 rounded border border-cyan-500/50 md:ml-auto">
                        MATRIX: ONLINE
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    
                    {/* INPUT MATRIX */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="cyber-card p-4 border border-white/10 bg-black/40">
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-[10px] font-bold text-primary uppercase tracking-widest block">Visual Directives</label>
                            </div>
                            <textarea 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="E.g., A cinematic album cover featuring the words 'SPACEJAMZ' in chrome block letters floating over a burning Tokyo skyline."
                                className="w-full h-40 bg-transparent text-white border border-primary/30 p-3 font-mono text-sm focus:outline-none focus:border-cyan-500 resize-none custom-scrollbar transition-colors"
                            />
                            <p className="text-[8px] font-mono text-gray-500 uppercase mt-2 tracking-widest">
                                * The engine inherently understands perfect typography. Write out exactly what text you want on the cover.
                            </p>
                        </div>

                        <CyberButton 
                            onClick={triggerFluxSynthesis} 
                            text={isGenerating ? "RENDERING..." : "SYNTHESIZE COVER ART"} 
                            kbd="GEN" 
                            disabled={isGenerating || !prompt} 
                            className="w-full h-14" 
                        />

                        {errorMsg && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 flex flex-col items-center justify-center text-center">
                                <ShieldAlert className="w-5 h-5 mb-2" />
                                <span className="text-[9px] font-mono uppercase tracking-widest">{errorMsg}</span>
                            </div>
                        )}
                    </div>

                    {/* ART GALLERY MATRIX */}
                    <div className="md:col-span-3">
                        <div className="cyber-card h-full p-4 border border-cyan-500/20 bg-cyan-500/5 min-h-[500px]">
                            
                            <h3 className="text-xs font-mono text-cyan-500 tracking-widest uppercase mb-6 flex items-center justify-between border-b border-cyan-500/20 pb-2">
                                <span className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Render Sequence Gallery</span>
                                {coverArts.length > 0 && <span className="text-[10px]">{coverArts.length} ASSETS DECODED</span>}
                            </h3>

                            {/* Loading State Overlay */}
                            {isGenerating && (
                                <div className="flex flex-col items-center justify-center space-y-4 w-full p-8 border border-magenta/20 bg-magenta/5 mb-6">
                                    <Zap className="w-8 h-8 text-magenta animate-pulse" />
                                    <div className="w-full max-w-xs h-1 bg-white/10 overflow-hidden mt-4">
                                        <div className="h-full bg-magenta w-1/2 animate-[slide_1s_ease-in-out_infinite]" />
                                    </div>
                                    <span className="text-[9px] font-mono text-magenta tracking-widest uppercase animate-pulse text-center">
                                        FLUX A100 GPU ENGAGED<br/>DECODING 1024x1024 STEREO MATRIX (~2 SECONDS)
                                    </span>
                                </div>
                            )}

                            {/* Empty Gallery State */}
                            {coverArts.length === 0 && !isGenerating && !errorMsg && (
                                <div className="h-full flex items-center justify-center opacity-30 flex-col">
                                    <ImageIcon className="w-12 h-12 mb-4" />
                                    <p className="text-[10px] font-mono tracking-widest uppercase text-center">
                                        Gallery is Empty.<br/>Awaiting visual directives.
                                    </p>
                                </div>
                            )}

                            {/* The Masonry Graphic Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {coverArts.map((art, idx) => (
                                    <div key={art.id} className="group relative bg-black/60 border border-white/10 hover:border-cyan-500/50 transition-colors flex flex-col">
                                        
                                        {/* Cover Art Image */}
                                        <div className="aspect-square w-full relative overflow-hidden">
                                            <img 
                                                src={art.url} 
                                                alt="Generated Album Cover" 
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            {/* Hover Toolbar */}
                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-between items-end h-1/2">
                                                <a 
                                                    href={art.url} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    download={`SpaceJamz_Cover_${idx}.webp`}
                                                    className="w-full font-mono text-[9px] bg-cyan-500 hover:bg-cyan-400 text-black py-2 px-3 uppercase font-bold tracking-widest flex items-center justify-center gap-2 transition-colors"
                                                >
                                                    <Download className="w-3 h-3" /> Save to Vault
                                                </a>
                                            </div>
                                        </div>

                                        {/* Telemetry Footer */}
                                        <div className="p-3 border-t border-white/5 bg-black/80 flex-1 flex flex-col">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[9px] font-mono text-cyan-500 tracking-widest uppercase flex items-center gap-1">
                                                    <Activity className="w-3 h-3" /> ASSET {art.id.slice(0, 6)}
                                                </span>
                                                <span className="text-[8px] text-gray-500 font-mono">1024x1024</span>
                                            </div>
                                            <p className="text-[8px] text-gray-400 font-mono tracking-wider line-clamp-3">
                                                {art.promptText}
                                            </p>
                                        </div>

                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                </div>
                
            </div>
            
            <style jsx>{`
                @keyframes slide {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
            `}</style>
        </div>
    );
}
