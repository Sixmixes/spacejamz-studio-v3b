"use client";
import React, { useState, useEffect } from 'react';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import { CyberButton } from '../ui/CyberButton';

const AgeVerificationModal = () => {
  const [mounted, setMounted] = useState(false);
  const [isVerified, setIsVerified] = useState(true);

  useEffect(() => {
    setMounted(true);
    setIsVerified(localStorage.getItem('spacejamz_age_verified') === 'true');
  }, []);

  const handleVerify = () => {
    localStorage.setItem('spacejamz_age_verified', 'true');
    setIsVerified(true);
  };

  const handleDecline = () => {
    window.location.href = 'https://www.google.com'; 
  };

  if (!mounted || isVerified) return null;

  return (
    <div className="fixed inset-0 z-[200000] flex items-center justify-center bg-black p-4 overflow-hidden">
      {/* Cinematic Smoke & Matrix Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#020202]/95 backdrop-blur-2xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--color-primary),0.05)_0,transparent_100%)] animate-pulse" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative w-full max-w-lg bg-[#050505] border-2 border-primary/20 p-8 md:p-12 text-center shadow-[0_45px_100px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-1000 z-10"
           style={{ clipPath: 'polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)' }}>
        
        {/* Tactical Accents */}
        <div className="absolute top-0 right-0 w-32 h-[1px] bg-primary/40 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-32 h-[1px] bg-primary/40 animate-pulse" />
        
        <div className="relative z-10">
            <div className="relative mb-8 inline-block">
                <Shield size={80} className="text-primary drop-shadow-[0_0_20px_rgba(var(--color-primary),0.5)] animate-[pulse_2s_ease-in-out_infinite]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <AlertTriangle size={32} className="text-primary/60 opacity-40" />
                </div>
            </div>
            
            <h2 className="font-bebas text-6xl md:text-7xl text-white mb-2 tracking-[0.2em] italic drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">NEURAL GATE</h2>
            
            <div className="flex items-center justify-center gap-4 mb-10">
                <div className="h-[1px] w-8 bg-primary/30" />
                <span className="font-mono text-[9px] text-primary uppercase tracking-[0.5em] font-black italic border-x px-4 border-primary/20">IPI_COMPLIANCE_RESTRICTED</span>
                <div className="h-[1px] w-8 bg-primary/30" />
            </div>
            
            <div className="bg-primary/5 border border-primary/10 p-6 mb-10 space-y-4 backdrop-blur-sm">
                <p className="font-mono text-[10px] md:text-[11px] text-gray-400 uppercase tracking-widest leading-relaxed">
                    THIS TERMINAL IS AUTHORIZED FOR USERS <strong className="text-white">18+ ONLY</strong>. 
                    NEURAL CONTRACTS AND AUDIO ASSETS MAY CONTAIN <strong className="text-primary">EXPLICIT FREQUENCIES</strong>.
                </p>
            </div>

            <div className="flex flex-col gap-4 max-w-xs mx-auto w-full">
                <CyberButton 
                    onClick={handleVerify}
                    text="INITIATE SYNC (18+)"
                    className="w-full h-16 text-lg tracking-[0.2em]"
                />
                
                <button 
                    onClick={handleDecline}
                    className="group border border-white/5 text-gray-500 font-bold uppercase tracking-[0.3em] text-[8px] py-4 hover:text-red-500 hover:bg-red-500/5 transition-all cyber-glitch-hover"
                >
                    [ DISCONNECT_SESSION ]
                </button>
            </div>
            
            <div className="mt-12 pt-6 border-t border-white/5 flex items-center justify-between opacity-30">
                <span className="font-mono text-[7px] text-primary/40 tracking-[0.4em] uppercase font-black italic">Gate_Node: 01A</span>
                <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary animate-ping" />
                    <span className="font-mono text-[7px] text-primary/40 tracking-[0.4em] uppercase font-black italic">System_Live</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AgeVerificationModal;
