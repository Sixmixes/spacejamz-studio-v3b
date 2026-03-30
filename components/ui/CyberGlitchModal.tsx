'use client';
import React from 'react';
import CyberGlitchButton from './CyberGlitchButton';

interface CyberGlitchModalProps {
    id: string;
    title: string;
    description: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
}

export default function CyberGlitchModal({
    id,
    title,
    description,
    confirmText = "Proceed",
    cancelText = "Cancel",
    onConfirm,
    onCancel
}: CyberGlitchModalProps) {
    
    return (
        <div className="modal" popover="auto" id={id}>
            <section className="modal__body">
                <div className="body__backdrop">
                    <div className="backdrop">
                        <div className="version">SYS.V3B.CORE</div>
                        <div className="corner"></div>
                    </div>
                </div>
                <div className="body__content">
                    <h2>
                        <span>{title}</span>
                    </h2>
                    <div className="body__text">
                        {description}
                    </div>
                    <div className="modal__glitch" aria-hidden="true">
                        <h2>
                            <span>{title}</span>
                        </h2>
                        <div className="body__text">
                            {description}
                        </div>
                    </div>
                </div>
            </section>
            <div className="modal__actions">
                <CyberGlitchButton 
                    text={cancelText} 
                    kbd="ESC" 
                    popoverTarget={id} 
                    popoverTargetAction="close"
                    onClick={onCancel}
                    data-action="Cancel"
                />
                <CyberGlitchButton 
                    text={confirmText} 
                    kbd="↵" 
                    popoverTarget={id} 
                    popoverTargetAction="close"
                    onClick={onConfirm}
                    data-action="Proceed"
                    autoFocus
                />
            </div>
        </div>
    );
}
