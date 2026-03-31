import React from 'react';
import { Database } from 'lucide-react';

export default function NeuralSwapPanel() {
    return (
        <div className="flex flex-col gap-8 bg-primary/5 rounded-3xl p-10 border border-solid border-primary/20 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-[80px]" />
            <div className="flex items-center gap-6 relative z-10">
                <div className="p-4 bg-primary/20 rounded-2xl border border-primary/40">
                    <Database className="text-primary animate-pulse" size={40} />
                </div>
                <div>
                    <h5 className="text-2xl font-black font-bebas text-white tracking-widest uppercase italic mb-1">
                        RVC Neural Blueprint
                    </h5>
                    <p className="text-[10px] font-mono text-primary/60 uppercase tracking-widest font-black">
                        Timbre Injection Mapping Pipeline
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 relative z-10">
                {['ST-01: Demucs Neural Stemming', 'ST-02: Pitch Variance Mapping', 'ST-03: Timbre Reconstruction'].map((step, i) => (
                    <div key={i} className="bg-black/80 border border-primary/10 p-5 flex items-center justify-between group-hover:border-primary/40 transition-all">
                        <div className="text-[11px] font-mono text-white uppercase tracking-widest">{step}</div>
                        <div className="w-2 h-2 rounded-full bg-primary/20 animate-pulse" />
                    </div>
                ))}
            </div>
        </div>
    );
}
