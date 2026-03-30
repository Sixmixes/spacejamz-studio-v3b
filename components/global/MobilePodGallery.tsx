'use client';
import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, LayoutGrid } from 'lucide-react';

export default function MobilePodGallery({ generations, equipBanner, deleteGeneration, toggleGridView }: { generations: any[], equipBanner: (url: string) => void, deleteGeneration: (id: string) => void, toggleGridView: () => void }) {
    const [stack, setStack] = useState(generations);

    const activeIndex = stack.length > 0 ? stack.length - 1 : -1;

    const handleDragEnd = (event: any, info: any, assetId: string) => {
        // If swiped left (dislike) - Trash it
        if (info.offset.x < -100) {
            deleteGeneration(assetId);
            setStack((prev) => prev.filter(g => g.id !== assetId));
        } 
        // If swiped right (like) - Keep it on your page
        else if (info.offset.x > 100) {
            setStack((prev) => prev.filter(g => g.id !== assetId));
        }
    };

    if (stack.length === 0) {
        return (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center p-8 text-center text-primary/40 font-mono text-xs animate-in fade-in">
                NO MORE IMAGES IN STACK.
                <button onClick={() => setStack(generations)} className="mt-4 border border-primary/20 bg-primary/10 px-4 py-2 text-white hover:bg-primary/20">RESET DECK</button>
            </div>
        );
    }

    return (
        <div className="relative w-full h-[calc(100dvh-450px)] min-h-[320px] max-h-[500px] flex items-center justify-center overflow-visible touch-pan-y mt-4 mb-16">
            
            <button 
                onClick={toggleGridView}
                className="absolute -top-10 right-4 z-50 p-2.5 bg-[#00ffff]/10 border border-[#00ffff]/40 rounded-full text-[#00ffff] shadow-[0_0_15px_rgba(0,255,255,0.2)] backdrop-blur-md active:scale-95 transition-transform"
            >
                <LayoutGrid size={18} />
            </button>

            <AnimatePresence>
                {stack.map((gen, index) => {
                    const isTop = index === activeIndex;
                    return (
                        <Card 
                            key={gen.id} 
                            gen={gen} 
                            isTop={isTop}
                            index={index}
                            stackLength={stack.length}
                            handleDragEnd={handleDragEnd}
                            equipBanner={equipBanner}
                            deleteGeneration={deleteGeneration}
                        />
                    );
                })}
            </AnimatePresence>

            <div className="absolute -bottom-6 left-0 right-0 text-center font-mono text-[9px] tracking-widest text-[#00ffff]/40 z-0">
                SWIPE <span className="text-[#00ffff]">&lt;&gt;</span> TO NAVIGATE DECK
            </div>
        </div>
    );
}

function Card({ gen, isTop, index, stackLength, handleDragEnd, equipBanner, deleteGeneration }: any) {
    const x = useMotionValue(0);
    // Twirl physics when dragged horizontally
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);

    // Tinder visual stamps
    const likeOpacity = useTransform(x, [50, 150], [0, 1]);
    const dislikeOpacity = useTransform(x, [-50, -150], [0, 1]);

    // Visually stack them
    const isNext = index === stackLength - 2;
    const isThird = index === stackLength - 3;

    let scale = 1;
    let yOffset = 0;
    if (!isTop) {
        if (isNext) {
            scale = 0.95;
            yOffset = -15;
        } else if (isThird) {
            scale = 0.9;
            yOffset = -30;
        } else {
            scale = 0.85;
            yOffset = -45;
        }
    }

    return (
        <motion.div
            className={`absolute w-[82vw] max-w-[380px] h-full rounded-2xl overflow-hidden border border-[#00ffff]/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-black ${isTop ? 'z-40' : 'z-10'}`}
            style={{ x, rotate, opacity: isTop ? opacity : 1 }}
            animate={{ scale, y: yOffset }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            drag={isTop ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={(e, info) => handleDragEnd(e, info, gen.id)}
            whileDrag={{ scale: 1.05, cursor: "grabbing" }}
        >
            {gen.type === 'deforum' ? (
                <video src={gen.assetUrl} className="w-full h-full object-cover pointer-events-none" autoPlay loop muted playsInline />
            ) : (
                <img src={gen.assetUrl} className="w-full h-full object-cover pointer-events-none" />
            )}

            {/* TINDER STAMPS */}
            {isTop && (
                <>
                    <motion.div 
                        className="absolute top-12 left-6 z-50 border-[4px] border-green-500 rounded-lg px-4 py-1 text-green-500 font-bebas text-4xl tracking-widest uppercase rotate-[-15deg] bg-black/40 backdrop-blur-sm pointer-events-none"
                        style={{ opacity: likeOpacity }}
                    >
                        KEEP
                    </motion.div>
                    <motion.div 
                        className="absolute top-12 right-6 z-50 border-[4px] border-red-500 rounded-lg px-4 py-1 text-red-500 font-bebas text-4xl tracking-widest uppercase rotate-[15deg] bg-black/40 backdrop-blur-sm pointer-events-none"
                        style={{ opacity: dislikeOpacity }}
                    >
                        TRASH
                    </motion.div>
                </>
            )}

            {/* INTERACTIVE HUD */}
            {isTop && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6">
                    {/* RED X (Top Left / Right) */}
                    <div className="w-full flex justify-between">
                        <button 
                            onClick={(e) => { e.stopPropagation(); deleteGeneration(gen.id); }}
                            className="pointer-events-auto p-4 bg-red-600/20 backdrop-blur-md rounded-full border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-90"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* MAKE PROFILE BANNER (Middle / Center-Bottom) */}
                    <div className="mt-auto mb-10 w-full flex justify-center">
                        <button 
                            onClick={(e) => { e.stopPropagation(); equipBanner(gen.assetUrl); }}
                            className="pointer-events-auto flex items-center gap-2 bg-black/80 backdrop-blur-xl border border-primary/50 text-primary px-8 py-4 rounded-full font-bebas text-xl tracking-widest uppercase hover:bg-primary hover:text-black transition active:scale-95 shadow-[0_0_30px_rgba(var(--color-primary),0.3)]"
                        >
                            <ImageIcon size={20} /> IDENTITY BANNER
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
