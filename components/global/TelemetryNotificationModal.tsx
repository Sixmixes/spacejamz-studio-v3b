'use client';

import { X, Terminal, Zap } from 'lucide-react';

interface TelemetryNotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TelemetryNotificationModal = ({ isOpen, onClose }: TelemetryNotificationModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-black/80 backdrop-blur-2xl border border-[#00ffff]/30 rounded-2xl p-6 sm:p-10 relative overflow-hidden shadow-[0_0_40px_rgba(0,255,255,0.1)]" style={{ clipPath: 'none' }}>
                
                {/* Close Overrides */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-20"
                >
                    <X size={24} />
                </button>
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#00ffff]/10 blur-xl pointer-events-none" />

                <div className="flex flex-col md:flex-row gap-10 sm:gap-16">
                    {/* LEFT DIAGNOSTICS */}
                    <div className="flex flex-col gap-6 flex-1">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <Terminal size={14} className="text-[#00ffff] animate-pulse" />
                                <span className="font-mono text-[10px] text-[#00ffff] uppercase tracking-[0.4em] font-black italic shadow-none drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]">Network_Live</span>
                            </div>
                            <div className="w-full h-1 bg-[#00ffff]/20 relative overflow-hidden rounded-full">
                                <div className="absolute inset-y-0 left-0 w-1/3 bg-[#00ffff] animate-slide-infinite" />
                            </div>
                            <span className="font-mono text-[8px] text-gray-400 uppercase tracking-widest font-bold italic">Packet_Loss: 0.00%</span>
                        </div>
                        <div className="bg-transparent border-l-2 border-solid border-[#00ffff]/30 p-4 space-y-3">
                            <span className="font-mono text-[7px] text-[#00ffff] uppercase tracking-[0.3em] font-black drop-shadow-[0_0_5px_rgba(0,255,255,0.3)]">System_Diagnostics:</span>
                            <div className="flex flex-col gap-1.5 font-mono text-[9px] text-gray-300 tracking-widest uppercase">
                                <div className="flex justify-between items-center gap-4">
                                    <span>GPU_Load</span>
                                    <span className="text-[#00ffff] font-black drop-shadow-[0_0_3px_#00ffff]">42%</span>
                                </div>
                                <div className="flex justify-between items-center gap-4">
                                    <span>Thread_Count</span>
                                    <span className="text-[#00ffff] font-black drop-shadow-[0_0_3px_#00ffff]">128</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT NODES */}
                    <div className="flex flex-col gap-8 flex-1 items-start md:items-end md:text-right">
                        <div className="bg-transparent border-r-2 border-solid border-[#00ffff]/30 p-4 space-y-2 w-full">
                            <div className="flex items-center md:justify-end gap-3 text-cyan-300 mb-1">
                                <span className="font-bebas text-2xl tracking-widest">Active nodes</span>
                                <Zap size={18} className="animate-pulse" />
                            </div>
                            <span className="font-mono text-[8px] text-[#00ffff] uppercase tracking-widest font-black drop-shadow-[0_0_5px_rgba(0,255,255,0.4)]">Sector_Foundry: ONLINE</span>
                        </div>
                        <div className="flex flex-col items-start md:items-end gap-3 w-full">
                            <div className="flex gap-1.5">
                                {[...Array(5)].map((_, i) => <div key={i} className={`w-4 h-1.5 rounded-sm ${i < 4 ? 'bg-[#00ffff]' : 'bg-[#00ffff]/20'}`} />)}
                            </div>
                            <span className="font-mono text-[7px] text-gray-400 uppercase tracking-widest font-black">Treasury_Sync: 100%</span>
                        </div>
                    </div>
                </div>

                {/* CRT Scanline */}
                <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(0,255,255,0.06),rgba(0,255,255,0.02),rgba(0,255,255,0.06))] bg-[length:100%_4px,4px_100%] animate-pulse" />
            </div>
        </div>
    );
};
