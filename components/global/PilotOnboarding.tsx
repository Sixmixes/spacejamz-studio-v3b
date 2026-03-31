'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShieldCheck, Zap, Terminal } from 'lucide-react';
import { CyberButton } from '@/components/ui/CyberButton';

export default function PilotOnboarding() {
    const { currentUser, setUser } = useUserStore();
    const [callsign, setCallsign] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (currentUser && currentUser.enrollmentComplete === false) {
            setCallsign(currentUser.displayName || '');
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [currentUser]);

    const handleCommence = async () => {
        if (!currentUser || !callsign.trim()) return;
        
        setIsSubmitting(true);
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                displayName: callsign,
                enrollmentComplete: true
            });
            
            setUser({ displayName: callsign, enrollmentComplete: true });
            setIsVisible(false);
        } catch (err) {
            console.error("Onboarding failed:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[20000] bg-black flex items-center justify-center p-4 overflow-hidden"
                >
                    {/* Background Tactical Matrix */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--color-primary),0.1)_0,transparent_100%)] animate-pulse" />
                        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(0,255,255,0.06),rgba(0,255,255,0.02),rgba(0,255,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]" />
                    </div>

                    <motion.div 
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        className="relative w-full max-w-lg bg-zinc-950 border border-primary/30 p-8 shadow-[0_0_100px_rgba(0,0,0,1)]"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}
                    >
                        {/* Header Decoration */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
                        
                        <div className="flex flex-col items-center text-center space-y-8">
                            <div className="flex flex-col items-center">
                                <div className="p-4 bg-primary/10 border border-primary/20 rounded-full mb-4">
                                    <ShieldCheck className="w-12 h-12 text-primary cyber-flicker-slow" />
                                </div>
                                <h1 className="text-3xl font-bebas tracking-[0.2em] text-white uppercase italic">
                                    Identity Calibration Required
                                </h1>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="w-8 h-px bg-primary/40" />
                                    <span className="font-mono text-[9px] text-primary/60 uppercase tracking-widest">Neural Enrollment Protocol</span>
                                    <span className="w-8 h-px bg-primary/40" />
                                </div>
                            </div>

                            <p className="font-mono text-[10px] text-gray-400 leading-relaxed uppercase tracking-widest">
                                Welcome to the Private Matrix. Before your neural bridge is established, you must confirm your tactical callsign.
                            </p>

                            <div className="w-full space-y-4">
                                <div className="relative">
                                    <div className="absolute -top-2.5 left-4 bg-zinc-950 px-2 flex items-center gap-1.5 z-10">
                                        <Terminal size={10} className="text-primary" />
                                        <label className="font-mono text-[8px] text-primary uppercase tracking-widest font-black">Callsign_Input</label>
                                    </div>
                                    <input 
                                        type="text" 
                                        value={callsign}
                                        onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                                        maxLength={24}
                                        placeholder="ENTER PILOT NAME..."
                                        className="w-full bg-black border border-primary/20 p-5 font-bebas text-3xl tracking-[0.1em] text-white focus:border-primary outline-none transition-all placeholder:text-zinc-800"
                                    />
                                    <div className="absolute bottom-0 right-0 p-1 font-mono text-[7px] text-primary/20 uppercase">Max_Chars: 24</div>
                                </div>

                                <div className="flex items-center gap-4 p-4 border border-yellow-500/10 bg-yellow-500/5">
                                    <Zap size={14} className="text-yellow-500 shrink-0" />
                                    <p className="text-[8px] font-mono text-yellow-500/80 text-left uppercase leading-relaxed tracking-widest">
                                        Airdrop Detected: Your account has been provisioned with 5,000 Laboratory Treasury coins for founders.
                                    </p>
                                </div>
                            </div>

                            <CyberButton 
                                onClick={handleCommence}
                                disabled={!callsign.trim() || isSubmitting}
                                text={isSubmitting ? "CALIBRATING..." : "COMMENCE ENROLLMENT"}
                                className="w-full h-16 text-xl tracking-[0.2em]"
                            />

                            <div className="pt-4 flex flex-col items-center">
                                <span className="font-mono text-[7px] text-white/20 uppercase tracking-[0.5em] mb-2 font-bold italic">SpaceJamz_Identity_Core_v3.2</span>
                                <div className="flex gap-2">
                                    <div className="w-1 h-1 bg-primary/20" />
                                    <div className="w-1 h-1 bg-primary/40 animate-pulse" />
                                    <div className="w-1 h-1 bg-primary/20" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
