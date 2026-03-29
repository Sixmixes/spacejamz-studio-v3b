'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ArchitectReceptacleProps {
    icon: LucideIcon;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string;
    borderColor?: string;
    glowColor?: string;
}

export const ArchitectReceptacle = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    children, 
    className = '',
    borderColor = 'border-primary/20',
    glowColor = 'rgb(var(--color-primary) / 0.1)'
}: ArchitectReceptacleProps) => {
    return (
        <div className={`cyber-panel p-6 bg-black/40 border ${borderColor} relative group overflow-hidden shadow-[inset_0_0_30px_${glowColor}] ${className}`}>
            {/* AMBIENT GLOW */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-20 blur-[60px] pointer-events-none" style={{ backgroundColor: glowColor }} />
            
            <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 border border-white/10 rounded-lg bg-white/5">
                        <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bebas text-2xl text-white uppercase tracking-[0.2em] leading-none">{title}</h3>
                        {subtitle && <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mt-1">{subtitle}</p>}
                    </div>
                </div>
            </div>

            <div className="relative z-10">
                {children}
            </div>

            {/* DECORATIVE CORNER ELEMENT */}
            <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-white/20" />
        </div>
    );
};
