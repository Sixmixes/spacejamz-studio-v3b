'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Zap, ArrowRight, Coins, Gift } from 'lucide-react';
import { NeuralModal } from '../ui/NeuralModal';
import { CyberButton } from '../ui/CyberButton';
import { useUserStore } from '@/store/useUserStore';

export default function AirdropModal() {
    const { currentUser } = useUserStore();
    const [isOpen, setIsOpen] = useState(false);
    const [hasClaimed, setHasClaimed] = useState(false);

    useEffect(() => {
        // High-Fidelity Logic: Trigger modal if user has a specific balance or a "founder" flag
        // For this demo, we'll check if coinsBalance === 5000 (The Founder Airdrop amount)
        if (currentUser?.coinsBalance === 5000 && !localStorage.getItem('spacejamz_airdrop_claimed')) {
            const timer = setTimeout(() => setIsOpen(true), 3000); // 3s delay for sensorial impact
            return () => clearTimeout(timer);
        }
    }, [currentUser]);

    const handleClaim = () => {
        setHasClaimed(true);
        localStorage.setItem('spacejamz_airdrop_claimed', 'true');
        setTimeout(() => setIsOpen(false), 2000);
    };

    return (
        <NeuralModal 
            isOpen={isOpen} 
            onClose={() => setIsOpen(false)} 
            title="FOUNDER AIRDROP DETECTED"
        >
            <div className="flex flex-col items-center text-center gap-8 py-4">
                <div className="relative group">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse group-hover:bg-primary/40 transition-all duration-1000" />
                    <div className="relative z-10 w-32 h-32 flex items-center justify-center bg-black border-2 border-primary rounded-full shadow-[0_0_50px_rgba(var(--color-primary),0.4)]">
                        <Gift size={64} className="text-primary animate-bounce" />
                    </div>
                    {/* Floating Bits */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-black border border-primary/40 rounded-sm flex items-center justify-center animate-spin-[10s]">
                        <Coins size={20} className="text-primary" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bebas text-5xl text-white tracking-widest italic uppercase">Nexus Founders Reward</h3>
                    <p className="font-mono text-[10px] text-gray-400 uppercase tracking-[0.4em] max-w-md mx-auto leading-relaxed italic">
                        Priority Neural Ingestion Complete. Your biometric signature was identified as one of the first <span className="text-primary font-black">50 Architects</span>.
                    </p>
                </div>

                <div className="w-full bg-primary/5 border border-primary/20 p-8 flex flex-col items-center gap-4 group/box relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover/box:translate-y-0 transition-transform duration-700" />
                    <span className="font-mono text-[9px] text-primary/40 uppercase tracking-widest relative z-10">Neural_Credit_Injection:</span>
                    <div className="flex items-baseline gap-4 relative z-10">
                        <span className="font-bebas text-8xl text-primary drop-shadow-[0_0_20px_rgba(var(--color-primary),0.6)] animate-pulse">5000</span>
                        <span className="font-mono text-xl text-primary/60 font-black italic">COINS</span>
                    </div>
                </div>

                <div className="w-full max-w-sm">
                    {hasClaimed ? (
                        <div className="p-6 bg-green-500/10 border border-green-500/40 text-green-500 font-mono text-[10px] uppercase tracking-[0.5em] font-black italic flex items-center justify-center gap-4 animate-in slide-in-from-bottom-4 duration-500">
                            <Zap size={16} className="animate-pulse" />
                            Credits Authorized
                        </div>
                    ) : (
                        <CyberButton 
                            text="AUTHORIZE INJECTION"
                            onClick={handleClaim}
                            className="w-full h-20 text-xl tracking-[0.3em]"
                        />
                    )}
                </div>

                <div className="pt-4 border-t border-white/5 w-full flex justify-between items-center px-4 opacity-40">
                    <span className="font-mono text-[7px] text-primary uppercase tracking-[0.5em] font-black italic">Status: Priority_A</span>
                    <div className="flex gap-2">
                        <div className="w-8 h-1 bg-primary/20" />
                        <div className="w-8 h-1 bg-primary/60" />
                        <div className="w-8 h-1 bg-primary/20" />
                    </div>
                </div>
            </div>
        </NeuralModal>
    );
}
