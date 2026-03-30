'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface AssetMatrixProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function AssetMatrix({ children, className = '', style }: AssetMatrixProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const card = cardRef.current;
    if (!container || !card) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate tilt degrees (max 15 degrees)
      const rotateX = ((y - centerY) / centerY) * -15; 
      const rotateY = ((x - centerX) / centerX) * 15;

      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        transformPerspective: 1000,
        ease: 'power2.out',
        duration: 0.5,
      });
    };

    const onMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        ease: 'power2.out',
        duration: 0.7,
      });
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);

    return () => {
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <div 
        ref={containerRef} 
        className={`relative w-full h-full group ${className}`} 
        style={{ ...style, perspective: '1000px' }}
    >
      <div 
        ref={cardRef} 
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div style={{ transform: 'translateZ(0px)', height: '100%', width: '100%' }}>
            {children}
        </div>
        
        {/* Holographic Glare Overlay - reacts physically via 3D space rather than JS calculation for better performance */}
        <div 
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 bg-gradient-to-tr from-transparent via-white/5 to-transparent mix-blend-overlay transition-opacity duration-300" 
            style={{ transform: 'translateZ(30px)' }} 
        />
      </div>
    </div>
  );
}
