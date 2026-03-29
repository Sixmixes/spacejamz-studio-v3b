'use client';
import React, { useEffect, useRef, memo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { coreAudioData, audioRef as globalAudioRef } from './AudioEngine';
import { useAudioStore } from '@/store/useAudioStore';
import { useUserStore } from '@/store/useUserStore';
import { useThemeStore } from '@/store/useThemeStore';

const WarpBackground = memo(() => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);
    const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isPlaying = useAudioStore(state => state.isPlaying);
    const isPlayingRef = useRef(isPlaying);
    const pathname = usePathname();
    const isHome = pathname === '/';
    const isProfile = pathname === '/profile';
    const currentUser = useUserStore(state => state.currentUser);
    const themeItem = currentUser?.enhancements?.find((e: string) => e.startsWith('theme_'));
    const customBg = isProfile ? themeItem : null;

    const getThemeColors = (theme: string) => {
        if (theme === 'battle') return { bass: '180, 0, 0', mid: '239, 68, 68', high: '255, 100, 100', white: '255, 255, 255' };
        if (theme === 'arena') return { bass: '150, 40, 0', mid: '249, 115, 22', high: '255, 180, 0', white: '255, 255, 255' };
        if (theme === 'toxic') return { bass: '132, 204, 22', mid: '132, 204, 22', high: '190, 242, 18', white: '255, 255, 255' };
        if (theme === 'royal') return { bass: '200, 150, 0', mid: '234, 179, 8', high: '250, 204, 21', white: '255, 255, 255' };
        if (theme === 'ghastly') return { bass: '60, 0, 100', mid: '168, 85, 247', high: '216, 180, 254', white: '255, 255, 255' };
        return { bass: '168, 85, 247', mid: '6, 182, 212', high: '249, 115, 22', white: '255, 255, 255' };
    };

    const activeTheme = useThemeStore(state => state.activeTheme);
    const themeColorsRef = useRef(getThemeColors(activeTheme));

    useEffect(() => {
        themeColorsRef.current = getThemeColors(activeTheme);
    }, [activeTheme]);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    // 1. Dynamic Parallax Logo Placement & Scaling
    useEffect(() => {
        if (!logoRef.current) return;
        const isMobile = window.innerWidth < 768;
        const zoomAnchor = isMobile ? '-8vh' : '-2vh';
        const restAnchor = isMobile ? '-8vh' : '-5vh';

        if (isHome) {
            // Start large, slightly blurred, and high up
            logoRef.current.style.transition = 'none';
            logoRef.current.style.transform = `translate(0px, 15vh) scale(2.0)`;
            logoRef.current.style.opacity = '0';

            const settleTimer = setTimeout(() => {
                if (logoRef.current && window.location.pathname === '/') {
                    // Trigger the cinematic drift-back and center into a dark b-roll state
                    logoRef.current.style.transition = 'transform 4000ms cubic-bezier(0.16, 1, 0.3, 1), opacity 2000ms ease-out';
                    logoRef.current.style.transform = `translate(0px, 0px) scale(0.6)`;
                    logoRef.current.style.opacity = '0.25';

                    setTimeout(() => {
                        if (logoRef.current && window.location.pathname === '/') {
                            logoRef.current.style.transition = 'transform 600ms cubic-bezier(0.2, 0.8, 0.2, 1)';
                        }
                    }, 4000);
                }
            }, 50);

            return () => clearTimeout(settleTimer);
        } else {
            logoRef.current.style.transition = 'transform 4000ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 800ms ease-out';
            logoRef.current.style.transform = `translate(0px, 0px) scale(0.9)`;
            logoRef.current.style.opacity = '0.18';
        }
    }, [isHome]);

    // 2. Gyroscopic & Mouse Parallax System
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!logoRef.current) return;
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = (e.clientY / window.innerHeight) * 2 - 1;

            const baseScale = isHome ? 0.6 : 0.9;
            const baseY = '0px';

            let offsetY = y * 20;
            if (isHome && offsetY > 10) offsetY = 10;

            logoRef.current.style.transform = `translate(calc(${x * 20}px), calc(${baseY} + ${offsetY}px)) scale(${baseScale})`;

            if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
            idleTimeoutRef.current = setTimeout(() => {
                if (logoRef.current) {
                    logoRef.current.style.transform = `translate(0px, ${baseY}) scale(${baseScale})`;
                }
            }, 2000);
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
        };
    }, [isHome]);

    // 3. High-Performance Warp Engine
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        let cx = width / 2;
        let cy = height / 2;

        const updateDimensions = () => {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Limit logical pixel scale to 1.0 (or below) to override high DPI Mac/Retina displays from crushing desktop iGPUs
            const dpr = Math.min(window.devicePixelRatio || 1, 1);

            width = viewportWidth * dpr;
            height = viewportHeight * dpr;

            canvas.style.width = viewportWidth + "px";
            canvas.style.height = viewportHeight + "px";

            cx = width / 2;
            cy = height / 2;

            canvas.width = width;
            canvas.height = height;
        };
        window.addEventListener('resize', updateDimensions);
        updateDimensions();

        const STAR_COUNT = window.innerWidth < 768 ? 50 : 200; // Optimized for mobile stability
        const stars: any[] = [];

        let rLow = 0, rMid = 0, rHigh = 0;
        let sLow = 0, sMid = 0, sHigh = 0, sInt = 0;

        class Star {
            x = 0; y = 0; z = 0; pz = 0; layer = 'white';
            constructor() {
                this.reset();
                this.z = Math.random() * width;
            }
            reset() {
                const angle = Math.random() * Math.PI * 2;
                const radius = (Math.random() * (width / 2)) + (width * 0.15);
                this.x = Math.cos(angle) * radius;
                this.y = Math.sin(angle) * radius;
                this.z = width;
                this.pz = this.z;

                const r = Math.random();
                if (r < 0.2) this.layer = 'bass';
                else if (r < 0.5) this.layer = 'mid';
                else if (r < 0.8) this.layer = 'high';
                else this.layer = 'white';
            }
            update(speedMultiplier: number) {
                this.pz = this.z;
                this.z -= speedMultiplier;
                if (this.z <= 1) this.reset();
            }
        }

        for (let i = 0; i < STAR_COUNT; i++) stars.push(new Star());

        let reqId: number;
        let isTabVisible = true;
        let lastAnimFrame = 0;
        const TARGET_FPS = 30;
        const THROTTLE_MS = 1000 / TARGET_FPS;

        const handleVisibilityChange = () => {
            isTabVisible = !document.hidden;
            if (isTabVisible) {
                render(performance.now()); // Re-kick the loop on wake
            }
        };

        const render = (time: number) => {
            if (!isTabVisible) return; // Exit loop if tab is buried

            if (time - lastAnimFrame < THROTTLE_MS) {
                reqId = requestAnimationFrame(render);
                return;
            }
            lastAnimFrame = time;

            let { intensity, low, mid, high } = coreAudioData?.current || { intensity: 0, low: 0, mid: 0, high: 0 };
            
            if (!isPlayingRef.current) {
                intensity = 0; low = 0; mid = 0; high = 0;
            }

            rLow = rLow * 0.8 + low * 0.2;
            rMid = rMid * 0.8 + mid * 0.2;
            rHigh = rHigh * 0.8 + high * 0.2;

            const rawTLow = Math.max(0, low - rLow) * 5.0;
            const rawTMid = Math.max(0, mid - rMid) * 4.0;
            const rawTHigh = Math.max(0, high - rHigh) * 3.0;

            sLow = Math.max(sLow * 0.96, rawTLow);
            sMid = Math.max(sMid * 0.96, rawTMid);
            sHigh = Math.max(sHigh * 0.96, rawTHigh);
            const thresholdedInt = Math.max(0, intensity - 0.15) * 1.15;
            sInt = Math.max(sInt * 0.88, thresholdedInt);

            ctx.fillStyle = 'rgba(0,2,8,0.15)';
            ctx.fillRect(0, 0, width, height);

            const currentThemeColors = themeColorsRef.current;

            const bassSpeed = (6 + Math.min(sLow * 120, 250) + Math.min(sInt * 30, 60));
            const midSpeed = (4 + Math.min(sMid * 80, 150) + Math.min(sInt * 20, 40));
            const highSpeed = (3 + Math.min(sHigh * 50, 100) + Math.min(sInt * 10, 20));
            const whiteSpeed = (3.0 + Math.min(sInt * 12.0, 25.0));

            ['bass', 'mid', 'high', 'white'].forEach(layer => {
                ctx.beginPath();
                let currentLineWidth = 1.0;

                if (layer === 'bass') currentLineWidth = 2.0 + Math.min(sLow * 6, 10);
                else if (layer === 'mid') currentLineWidth = 1.5 + Math.min(sMid * 5, 8);
                else if (layer === 'high') currentLineWidth = 1.0 + Math.min(sHigh * 3, 5);

                ctx.lineWidth = currentLineWidth;

                const heat = layer === 'bass' ? sLow : layer === 'mid' ? sMid : sHigh;
                ctx.strokeStyle = `rgba(${currentThemeColors[layer as keyof typeof currentThemeColors]}, ${Math.min(1.0, 0.6 + heat * 2.0 + sInt * 0.8)})`;

                ctx.shadowBlur = 0;
                ctx.shadowColor = 'transparent';

                stars.forEach(s => {
                    if (s.layer !== layer) return;

                    let speed = whiteSpeed;
                    if (layer === 'bass') speed = bassSpeed;
                    else if (layer === 'mid') speed = midSpeed;
                    else if (layer === 'high') speed = highSpeed;

                    s.update(speed);

                    const px = (s.x / s.pz) * cx + cx;
                    const py = (s.y / s.pz) * cy + cy;
                    const x = (s.x / s.z) * cx + cx;
                    const y = (s.y / s.z) * cy + cy;

                    if (x >= 0 && x <= width && y >= 0 && y <= height) {
                        ctx.moveTo(px, py);
                        ctx.lineTo(x, y);
                    }
                });

                ctx.stroke();
            });

            ctx.globalAlpha = 1.0;
            reqId = requestAnimationFrame(render);
        };

        render(performance.now());
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('resize', updateDimensions);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            cancelAnimationFrame(reqId);
        };
    }, []);

    const handleLogoClick = () => {
        if (!isHome) return;

        try {
            if (!isPlaying) {
                const state = useAudioStore.getState();
                if (!state.currentTrack?.src) {
                    state.setCurrentTrack({
                        id: 'sys-boot',
                        title: 'NEURAL HANDSHAKE',
                        producer: 'THE ARCHITECT',
                        src: '/trip.mp3'
                    });
                }
                state.setIsPlaying(true);
                if (globalAudioRef) {
                    globalAudioRef.src = state.currentTrack?.src || '/trip.mp3';
                    globalAudioRef.load();
                    globalAudioRef.play().catch(e => console.warn(e));
                }
            } else {
                useAudioStore.getState().togglePlay();
                if (globalAudioRef) {
                    globalAudioRef.pause();
                }
            }
        } catch (e) { }
    };

    return (
        <div className="fixed inset-0 z-0 bg-transparent overflow-hidden pointer-events-none flex items-center justify-center">
            {/* PHYSICS STARFIELD CANVAS (Hardware Accelerated) */}
            <canvas
                ref={canvasRef}
                className={`absolute inset-0 w-full h-full z-[8] transition-opacity duration-1000 opacity-100 mix-blend-screen`}
                style={{ transform: 'translateZ(0)' }}
            />
            {/* 3D PARALLAX BACKGROUND LOGO W/ ZERO-LATENCY DIRECT DOM MANIPULATION */}
            <div className={`absolute z-[15] mix-blend-screen flex flex-col items-center justify-center w-full h-full pointer-events-none`}>
                <div
                    ref={logoRef}
                    onClick={handleLogoClick}
                    className={`relative flex flex-col items-center justify-center group ${isHome ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'}`}
                >
                    {/* REACTIVE GLOW AURA (Static text, dynamic energy) */}
                    <div
                        className="absolute inset-0 bg-primary/20 rounded-full blur-[100px] pointer-events-none transition-opacity duration-300"
                        style={{
                            transform: `scale(calc(0.5 + (var(--audio-intensity, 0) * 0.3)))`,
                            opacity: `calc(0.02 + (var(--audio-intensity, 0) * 0.08))`
                        }}
                    />

                    <div className="relative">
                        <img
                            src="/images/logo_cosmos.webp"
                            alt="SpaceJamz Background"
                            className="w-[52vw] md:w-[37vw] xl:w-[26vw] max-w-xl max-h-[22vh] md:max-h-[30vh] object-contain"
                            style={{
                                filter: "brightness(calc(0.35 + var(--audio-intensity, 0) * 0.15)) drop-shadow(0 0 calc(10px + var(--bass-kick, 0) * 5px) rgba(0,0,0,0.9)) sepia(calc(var(--audio-intensity, 0) * 0.3)) hue-rotate(180deg)",
                                transform: "scale(calc(1 + var(--bass-kick, 0) * 0.02)) translateY(calc(var(--bass-kick, 0) * 3px))",
                                transition: "transform 0.08s ease-out, filter 0.08s ease-out"
                            }}
                        />
                    </div>
                    {isHome && (
                        <div className="absolute -bottom-10 text-[10px] md:text-xs font-mono tracking-widest text-cyan-500 uppercase opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] whitespace-nowrap bg-black/50 px-4 py-2 rounded-full border border-cyan-500/30">
                            {'<'} INITIATE AUDIO OVERRIDE {'>'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default WarpBackground;
