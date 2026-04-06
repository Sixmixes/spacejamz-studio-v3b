'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Sparkles, RefreshCw } from 'lucide-react';

interface RAPGSlotMachineProps {
    prompt: string;
    setPrompt: (p: string) => void;
}

const LISTS = {
    SUBJECT: [
        "A lone cyber-monk", "A shattered porcelain android", "A neon-drenched samurai", 
        "A massive orbital dreadnought", "A bioluminescent deep-sea leviathan", 
        "A rogue AI mainframe", "A phantom data-courier", "A chrome-plated gargoyle", 
        "A squad of tactical hackers", "A holographic geisha", "An overgrown mech frame"
    ],
    ACTION: [
        "meditating in the rain", "breaching the atmosphere", "dissolving into data streams", 
        "standing over a defeated mech", "floating in zero gravity", "hacking a neural port", 
        "summoning a digital storm", "awakening from cryosleep", "synthesizing an energy blade"
    ],
    ENVIRONMENT: [
        "in a brutalist concrete megacity", "inside a shattered quantum reactor", 
        "on the edge of a black hole accretion disk", "in a forgotten subterranean temple", 
        "atop a floating glass pyramid", "within an infinite server farm", 
        "in a neon-lit cyberpunk alleyway", "surrounded by floating monolithic ruins"
    ],
    LIGHTING: [
        "volumetric god rays", "harsh neon underglow", "strobe lighting", 
        "thick radioactive fog", "bioluminescent spores floating in the air", 
        "diffused cinematic lighting", "lens flares", "crimson emergency alarms flashing"
    ],
    AESTHETIC: [
        "shot on 35mm film", "8k resolution octane render", "unreal engine 5 cinematic", 
        "macro photography, shallow depth of field", "vintage anime aesthetic, 1990s cel shading", 
        "hyper-realistic matte painting", "style of H.R. Giger", "synthwave retrowave aesthetic"
    ]
};

type SlotCategory = keyof typeof LISTS;

interface SlotState {
    value: string;
    isLocked: boolean;
}

export default function RAPGSlotMachine({ prompt, setPrompt }: RAPGSlotMachineProps) {
    const [slots, setSlots] = useState<Record<SlotCategory, SlotState>>({
        SUBJECT: { value: LISTS.SUBJECT[0], isLocked: false },
        ACTION: { value: LISTS.ACTION[0], isLocked: false },
        ENVIRONMENT: { value: LISTS.ENVIRONMENT[0], isLocked: false },
        LIGHTING: { value: LISTS.LIGHTING[0], isLocked: false },
        AESTHETIC: { value: LISTS.AESTHETIC[0], isLocked: false },
    });
    
    // Animation trigger keys to force re-render/re-spin
    const [spinKeys, setSpinKeys] = useState<Record<SlotCategory, number>>({
        SUBJECT: 0, ACTION: 0, ENVIRONMENT: 0, LIGHTING: 0, AESTHETIC: 0
    });

    const categories = Object.keys(LISTS) as SlotCategory[];

    // Auto-sync prompt to NeuralStudioApp whenever slots change
    useEffect(() => {
        const combined = `${slots.SUBJECT.value} ${slots.ACTION.value} ${slots.ENVIRONMENT.value}, ${slots.LIGHTING.value}, ${slots.AESTHETIC.value}. Masterpiece, highly detailed, trending on ArtStation.`;
        setPrompt(combined);
    }, [slots, setPrompt]);

    const r = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    const handleSpinAll = () => {
        setSlots(prev => {
            const next = { ...prev };
            const nextKeys = { ...spinKeys };
            categories.forEach(cat => {
                if (!prev[cat].isLocked) {
                    next[cat].value = r(LISTS[cat]);
                    nextKeys[cat] = nextKeys[cat] + 1;
                }
            });
            setSpinKeys(nextKeys);
            return next;
        });
    };

    const handleSpinSingle = (cat: SlotCategory) => {
        if (slots[cat].isLocked) return;
        setSlots(prev => ({
            ...prev,
            [cat]: { ...prev[cat], value: r(LISTS[cat]) }
        }));
        setSpinKeys(prev => ({ ...prev, [cat]: prev[cat] + 1 }));
    };

    const toggleLock = (cat: SlotCategory) => {
        setSlots(prev => ({
            ...prev,
            [cat]: { ...prev[cat], isLocked: !prev[cat].isLocked }
        }));
    };

    return (
        <div className="w-full flex justify-center -mb-4 lg:mb-0 relative py-2">
            

            <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 relative z-10 p-0 sm:p-2">
                {categories.map((cat, idx) => (
                    <div 
                        key={cat} 
                        className={`flex flex-col border ${slots[cat].isLocked ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-primary/30 bg-black/80'} rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)] group relative transition-all duration-300`}
                    >
                        <div className={`p-2 border-b ${slots[cat].isLocked ? 'border-yellow-500/30' : 'border-primary/20'} flex items-center justify-between`}>
                            <span className={`text-[8px] md:text-[9px] font-mono uppercase tracking-[0.2em] font-black ${slots[cat].isLocked ? 'text-yellow-500' : 'text-primary/60'}`}>
                                {cat}
                            </span>
                            <button 
                                onClick={() => toggleLock(cat)}
                                className={`p-1 rounded-md transition-colors ${slots[cat].isLocked ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-primary/10 text-primary hover:bg-primary hover:text-black'}`}
                            >
                                {slots[cat].isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                            </button>
                        </div>
                        
                        <div className="h-24 md:h-32 p-3 flex items-center justify-center text-center relative overflow-hidden">
                            <AnimatePresence mode="popLayout">
                                <motion.div
                                    key={`${cat}-${spinKeys[cat]}`}
                                    initial={{ y: 50, opacity: 0, filter: 'blur(4px)' }}
                                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                                    exit={{ y: -50, opacity: 0, filter: 'blur(4px)' }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    className="absolute inset-0 flex items-center justify-center p-3"
                                >
                                    <span className={`font-bebas text-lg md:text-xl md:tracking-wider leading-tight ${slots[cat].isLocked ? 'text-yellow-500/90' : 'text-white'}`}>
                                        {slots[cat].value}
                                    </span>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        
                        <button 
                            onClick={() => handleSpinSingle(cat)}
                            disabled={slots[cat].isLocked}
                            className={`p-2 transition-colors flex items-center justify-center border-t ${slots[cat].isLocked ? 'border-yellow-500/30 text-yellow-500/50 bg-yellow-500/5 cursor-not-allowed' : 'border-primary/20 text-primary hover:bg-primary/20 hover:text-white bg-black/60'}`}
                        >
                            <RefreshCw size={14} className={slots[cat].isLocked ? '' : 'group-hover:animate-spin'} />
                        </button>
                    </div>
                ))}

                {/* Master Spin Control replaces the final missing slot cell on mobile, but on desktop it overlays or goes below */}
            </div>

            <div className="absolute -bottom-8 md:-bottom-12 right-0 left-0 flex justify-center z-20 pointer-events-none">
                 <button 
                    onClick={handleSpinAll}
                    style={{ clipPath: 'polygon(15px 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 0 100%, 0 15px)' }}
                    className="pointer-events-auto px-8 md:px-12 py-3 md:py-4 bg-[rgb(var(--color-primary))] text-black font-black font-bebas text-xl md:text-3xl tracking-[0.2em] shadow-[0_0_40px_rgba(var(--color-primary),0.6)] hover:bg-white hover:text-black hover:shadow-[0_0_60px_rgba(255,255,255,0.8)] transition-all flex items-center gap-3 active:scale-95 group"
                 >
                     <Sparkles className="animate-pulse text-black" />
                     SPIN UNLOCKED
                 </button>
            </div>
        </div>
    );
}
