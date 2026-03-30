import React from 'react';

interface CyberGlitchButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'popoverTarget' | 'popoverTargetAction'> {
    text: string;
    kbd?: string;
    glitchText?: string;
    popoverTarget?: string;
    popoverTargetAction?: string;
}

export default function CyberGlitchButton({ text, kbd, glitchText, className, popoverTarget, popoverTargetAction, ...props }: CyberGlitchButtonProps) {
    const letters = (glitchText || text).split('');

    // Handle standard react popover targets if passed
    const popoverProps = popoverTarget ? {
        popoverTarget: popoverTarget,
        popoverTargetAction: popoverTargetAction || 'show'
    } : {};

    return (
        <button 
            className={`cyber-btn ${className || ''}`} 
            {...props} 
            {...popoverProps as any}
        >
            <span className="backdrop">
                <span className="corner"></span>
            </span>
            {kbd && <kbd>{kbd}</kbd>}
            <span>{text}</span>
            <div className="glitch" aria-hidden="true">
                <span className="backdrop">
                    <span className="corner"></span>
                </span>
                {kbd && <kbd>{kbd}</kbd>}
                <span className="letters">
                    {letters.map((char, i) => (
                        <span key={i}>{char === ' ' ? '\u00A0' : char}</span>
                    ))}
                </span>
            </div>
        </button>
    );
}
