'use client';
import React, { useState } from 'react';

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    text: string;
    kbd?: React.ReactNode;
    variant?: 'primary' | 'danger';
}

export function CyberButton({ text, kbd, className = '', variant = 'primary', onMouseEnter, ...props }: CyberButtonProps) {
    const [glitchAnim, setGlitchAnim] = useState(1);
    const [randomTag, setRandomTag] = useState('00');

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
        // PROCEDURAL RANDOMIZATION ENGINE
        const nextAnim = Math.floor(Math.random() * 3) + 1;
        setGlitchAnim(nextAnim);
        setRandomTag(Math.floor(Math.random() * 99).toString().padStart(2, '0'));
        if (onMouseEnter) onMouseEnter(e);
    };

    return (
        <button 
            className={`cyber-btn ${variant === 'danger' ? 'danger' : ''} ${className} group/cyber`} 
            onMouseEnter={handleMouseEnter}
            {...props}
        >
            <div className="absolute -left-2 top-0 bottom-0 w-1 bg-primary/20 group-hover/cyber:bg-primary transition-colors" />
            
            <span className="backdrop relative overflow-hidden">
                <span className="corner"></span>
                <div className="absolute top-0 right-0 p-1 opacity-20 translate-x-2 group-hover/cyber:translate-x-0 transition-transform">
                    <span className="font-mono text-[6px] text-primary font-black">NODE_{randomTag}</span>
                </div>
            </span>

            <span className="relative z-10 flex items-center gap-3">
                {kbd && <span className="opacity-40 group-hover/cyber:opacity-100 transition-opacity translate-y-[1px]">{kbd}</span>}
                <span className="font-black">{text}</span>
            </span>

            <div className="glitch" aria-hidden="true" style={{ animationName: `cyber-glitch-${glitchAnim}` }}>
                <span className="backdrop">
                    <span className="corner"></span>
                </span>
                <span className="letters">
                    {text.split('').map((char, i) => (
                        <span key={i} className={char === ' ' ? 'mx-1' : ''}>{char}</span>
                    ))}
                </span>
            </div>
        </button>
    );
}
