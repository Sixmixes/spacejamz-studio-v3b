'use client';
import React, { useState } from 'react';

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    text: string;
    kbd?: React.ReactNode;
    variant?: 'primary' | 'danger';
}

export function CyberButton({ text, kbd, className = '', variant = 'primary', onMouseEnter, ...props }: CyberButtonProps) {
    const [glitchAnim, setGlitchAnim] = useState(1);

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
        setGlitchAnim(Math.floor(Math.random() * 3) + 1);
        if (onMouseEnter) onMouseEnter(e);
    };

    return (
        <button 
            className={`cyber-btn ${variant === 'danger' ? 'danger' : ''} ${className}`} 
            onMouseEnter={handleMouseEnter}
            {...props}
        >
            <span className="backdrop">
                <span className="corner"></span>
            </span>
            <span>{text}</span>
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
