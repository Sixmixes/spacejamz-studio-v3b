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

    // Check if touch device globally for all listeners
    const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    const onMouseMove = (e: MouseEvent) => {
      if (isTouch) return; // Completely override desktop hover interaction on touch devices so tap-to-stop doesn't freeze the card!
      
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
      if (isTouch) return;
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        ease: 'power2.out',
        duration: 0.7,
      });
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);

    let scrollTimeout: any = null;
    let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    let lastTapTime = 0; // Tracks when you tapped to stop the inertia scroll

    const onScroll = () => {
        if (!isTouch || !container) return;

        // Prevent trailing momentum scroll events from immediately overriding the tap-to-stop snap!
        if (Date.now() - lastTapTime < 300) return;
        
        const currentScrollY = window.scrollY;
        const deltaY = currentScrollY - lastScrollY;
        lastScrollY = currentScrollY;

        const rect = container.getBoundingClientRect();
        // Check if card is roughly on screen
        if (rect.top > window.innerHeight || rect.bottom < 0) return;

        // Calculate card's horizontal center to gently tilt it inward consistently
        const centerX = window.innerWidth / 2;
        const cardCenterX = rect.left + rect.width / 2;
        const offsetX = cardCenterX - centerX;
        
        // Tilt intensely based on scroll velocity (swiping up vs down)
        // deltaY > 0 -> scrolling down (content up) -> tilts top backwards (rotateX positive)
        const rX = Math.max(-7.5, Math.min(7.5, deltaY * 0.2));
        
        // Gentle deterministic side-wiggle based on which side of the screen it's on to feel 3D
        const rY = (offsetX > 0 ? 1 : -1) * Math.min(2.5, Math.abs(deltaY * 0.025));

        gsap.to(card, {
            rotateX: rX, // Dynamic swipe direction mapping
            rotateY: rY,
            transformPerspective: 1000,
            duration: 0.4, // Smoother fluid attack instead of a rigid track
            ease: 'power2.out', // Gently glides between up and down directions
            overwrite: 'auto'
        });

        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        
        scrollTimeout = setTimeout(() => {
            // Long, ultra-smooth release back to static
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.8, // Quickened release per user feedback
                ease: 'power3.out'
            });
        }, 500); // Wait 0.5s in the tilted position before flattening
    };

    const onTouchStart = () => {
        lastTapTime = Date.now();
        clearTimeout(scrollTimeout); // Kill any pending float release!
        
        // If they tap the screen while scrolling (tap to stop inertia), rapidly but smoothly return to flat
        gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.3, // Almost instantly but not instantly (nice organic recoil)
            ease: 'power2.out',
            overwrite: 'auto'
        });
    };

    if (isTouch) {
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('touchstart', onTouchStart, { passive: true });
    }

    return () => {
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
      if (isTouch) {
          window.removeEventListener('scroll', onScroll);
          window.removeEventListener('touchstart', onTouchStart);
      }
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
