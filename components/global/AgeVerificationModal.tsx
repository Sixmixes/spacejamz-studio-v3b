"use client";
import React, { useState, useEffect } from 'react';
import { Shield, Lock } from 'lucide-react';

const AgeVerificationModal = () => {
  const [mounted, setMounted] = useState(false);
  const [isVerified, setIsVerified] = useState(true); // Default true to prevent hydration mismatch flashes

  useEffect(() => {
    setMounted(true);
    setIsVerified(localStorage.getItem('spacejamz_age_verified') === 'true');
  }, []);

  const [smokeParticles] = useState(() => 
    Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 200 - 100,
      y: Math.random() * 200 - 100,
      size: Math.random() * 300 + 200,
      delay: Math.random() * 10,
      duration: Math.random() * 10 + 10,
      left: Math.random() * 100,
      top: Math.random() * 100,
    }))
  );

  const handleVerify = () => {
    localStorage.setItem('spacejamz_age_verified', 'true');
    setIsVerified(true);
  };

  const handleDecline = () => {
    window.location.href = 'https://www.google.com'; 
  };

  if (!mounted || isVerified) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black p-6 overflow-hidden">
      {/* Cinematic Smoke Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 mix-blend-screen">
          {smokeParticles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full bg-primary/10 blur-[80px] animate-pulse"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                transform: `translate(${p.x}px, ${p.y}px)`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="cyber-panel border-primary/20 max-w-md w-full p-6 md:p-10 text-center relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-700 z-10 custom-scrollbar">
        {/* Decorative Grid/Glow */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none opacity-50"></div>

        <div className="relative z-10">
            <Shield size={64} className="mx-auto text-primary mb-6 drop-shadow-[0_0_20px_rgba(var(--color-primary),0.5)] animate-[pulse_2s_ease-in-out_infinite]" />
            
            <h2 className="font-bebas text-5xl md:text-6xl text-white mb-2 tracking-widest drop-shadow-[0_0_15px_rgba(var(--color-primary),0.4)]">CLEARANCE GATE</h2>
            
            <div className="inline-block bg-primary/10 border border-primary/50 text-primary font-mono font-bold uppercase text-[9px] md:text-[11px] tracking-[0.3em] px-4 py-2 mb-8 rounded shadow-[0_0_15px_rgba(var(--color-primary),0.1)]">
                IPI COMPLIANCE // 18+ REQUIRED
            </div>
            
            <p className="font-mono text-[10px] md:text-[11px] text-gray-400 mb-8 uppercase tracking-widest leading-loose max-w-sm mx-auto">
                SpaceJamz Studio is a professional audio ecosystem designed for the legal execution of <strong className="text-white">IPI Metadata Routing</strong> and <strong className="text-white">Digital Contract Ingestion</strong>.
            </p>
            
            <p className="text-gray-300 mb-10 text-xs md:text-sm font-light leading-relaxed">
                By entering the matrix, you verify you are <strong className="text-primary font-bold">18 years or older</strong>, authorized to sign binding audio contracts, and acknowledge exposure to uncensored, explicit lyrical content.
            </p>

            <div className="flex flex-col gap-4">
                <button 
                    onClick={handleVerify}
                    className="group w-full bg-primary text-black font-black uppercase tracking-widest text-xs py-4 hover:bg-white transition-all shadow-[0_0_30px_rgba(var(--color-primary),0.3)] flex items-center justify-center gap-2 cyber-button-clip"
                >
                    <Lock size={14} className="group-hover:rotate-12 transition-transform" />
                    INITIATE NEURAL SYNC
                </button>
                
                <button 
                    onClick={handleDecline}
                    className="w-full bg-transparent border border-white/5 text-gray-500 font-bold uppercase tracking-widest text-[9px] py-4 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all cyber-button-clip"
                >
                    ACCESS DENIED (UNDER 18)
                </button>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5 font-mono text-[8px] text-gray-600 tracking-[0.4em] uppercase">
                Legal Dimension // Pro Audio Standards
            </div>
        </div>
      </div>
    </div>
  );
};

export default AgeVerificationModal;
