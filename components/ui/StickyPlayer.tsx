'use client';

import React, { useState, useEffect, memo } from 'react';
import { Play, Square, Pause, Shuffle, SkipForward, SkipBack, Volume2, VolumeX, Database, X, Cpu } from 'lucide-react';
import { useAudioStore } from '@/store/useAudioStore';
import { audioRef, analyserRef, coreAudioData } from '@/components/global/AudioEngine';

const ProgressBar = memo(() => {
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const audio = audioRef;
        if (!audio) return;
        const updateProgress = () => {
            setProgress(audio.currentTime);
            setDuration(audio.duration || 0);
        };
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', updateProgress);
        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('loadedmetadata', updateProgress);
        };
    }, []);

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (audioRef) {
            audioRef.currentTime = parseFloat(e.target.value);
            setProgress(parseFloat(e.target.value));
        }
    };

    return (
        <input 
            type="range" 
            min={0} 
            max={duration || 100} 
            step="0.1"
            value={progress || 0} 
            onChange={handleSeek}
            className="absolute top-0 left-0 w-full h-[3px] hover:h-4 opacity-80 hover:opacity-100 appearance-none cursor-pointer z-50 focus:outline-none transition-all duration-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-0 hover:[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            style={{
              background: `linear-gradient(to right, rgb(6,182,212) ${((progress || 0) / (duration || 1)) * 100}%, rgba(255,255,255,0.1) ${((progress || 0) / (duration || 1)) * 100}%)`
            }}
            title="Seek Track"
        />
    );
});

const VolumeControl = memo(() => {
    const volume = useAudioStore(state => state.volume);
    const isMuted = useAudioStore(state => state.isMuted);
    const setVolume = useAudioStore(state => state.setVolume);
    const toggleMute = useAudioStore(state => state.toggleMute);

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
    };

    return (
        <div className="flex items-center gap-3 group">
            <button onClick={toggleMute} className="text-gray-500 hover:text-white transition-colors" title={isMuted ? "Unmute" : "Mute"}>
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input 
                type="range" 
                min={0} 
                max={1} 
                step="0.01" 
                value={isMuted ? 0 : volume} 
                onChange={handleVolumeChange}
                className="w-16 md:w-20 lg:w-24 h-1 opacity-50 hover:opacity-100 appearance-none cursor-pointer focus:outline-none transition-all duration-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                style={{
                  background: `linear-gradient(to right, rgb(var(--color-primary)) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) ${(isMuted ? 0 : volume) * 100}%)`
                }}
            />
        </div>
    );
});

const MINIMAP_MULTS = [0.85, 0.32, 0.94, 0.51, 0.27, 0.76, 0.43, 0.88, 0.35, 0.62, 0.91, 0.47, 0.73, 0.22, 0.81, 0.55];

const AudioMinimap = memo(({ isPlaying }: { isPlaying: boolean }) => {
    return (
        <div className="flex justify-end gap-[3px] h-6 items-end">
            {MINIMAP_MULTS.map((mult, i) => (
                <div 
                    key={i} 
                    className="w-1.5 rounded-t-sm origin-bottom transition-all duration-75"
                    style={{ 
                        backgroundColor: 'rgb(var(--color-primary))',
                        height: '100%',
                        transform: isPlaying ? `scaleY(calc(0.1 + (var(--audio-intensity, 0) * ${mult} * 1.5)))` : 'scaleY(0.1)',
                        opacity: isPlaying ? 0.8 : 0.2
                    } as React.CSSProperties}
                ></div>
            ))}
        </div>
    );
});

const AudioTimer = memo(() => {
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [displayMode, setDisplayMode] = useState(0); 

    useEffect(() => {
        const audio = audioRef;
        if (!audio) return;
        const updateProgress = () => {
            setProgress(audio.currentTime);
            setDuration(audio.duration || 0);
        };
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', updateProgress);
        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('loadedmetadata', updateProgress);
        };
    }, []);

    if (!duration) return null;

    const formatTime = (time: number) => {
        if (isNaN(time)) return "00:00";
        const m = Math.floor(time / 60);
        const s = Math.floor(time % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const cycleMode = () => {
        setDisplayMode((prev) => (prev + 1) % 3);
    };

    let displayText;
    if (displayMode === 0) {
        displayText = (
            <>
                <span>{formatTime(progress)}</span>
                <span className="mx-1.5 opacity-40">/</span>
                <span>{formatTime(duration)}</span>
            </>
        );
    } else if (displayMode === 1) {
        displayText = <span>{formatTime(progress)}</span>;
    } else {
        displayText = <span>-{formatTime(duration - progress)}</span>;
    }

    return (
        <div 
            onClick={cycleMode}
            className="hidden lg:flex items-center justify-center font-mono text-[10px] text-gray-500 tracking-widest px-2 min-w-[90px] cursor-default select-none"
            title=""
        >
            {displayText}
        </div>
    );
});

const FrequencyLine = memo(({ isPlaying }: { isPlaying: boolean }) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const animationRef = React.useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        let width = window.innerWidth;
        let height = 80;

        const updateDimensions = () => {
            width = canvas.width = window.innerWidth * window.devicePixelRatio;
            height = canvas.height = 80 * window.devicePixelRatio;
        };
        window.addEventListener('resize', updateDimensions);
        updateDimensions();

        const bufferLength = 1024; // Half of 2048 FFT Size
        let smoothedValues = new Float32Array(bufferLength);
        smoothedValues.fill(0); // Resting flatline at bottom

        const render = () => {
            const freqData = new Uint8Array(bufferLength);
            
            if (isPlaying && analyserRef.current) {
                // Read exact frequency bin data (like the JS snippet you linked)
                analyserRef.current.getByteFrequencyData(freqData);
            } else {
                freqData.fill(0);
            }

            ctx.clearRect(0, 0, width, height);

            ctx.lineWidth = 2 * window.devicePixelRatio;
            
            // Create a stunning cyber-gradient for the line fill
            const gradient = ctx.createLinearGradient(0, height, 0, 0);
            gradient.addColorStop(0, 'rgba(6, 182, 212, 0)');
            gradient.addColorStop(1, 'rgba(6, 182, 212, 0.4)');

            ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)'; 
            ctx.fillStyle = gradient;

            ctx.beginPath();
            
            // Start path at bottom left
            ctx.moveTo(0, height);

            // Dynamically scale width so it stretches exactly across the canvas
            // We only look at the first 75% of frequencies since the top end is mostly empty air
            const activeBins = Math.floor(bufferLength * 0.75);
            const sliceWidth = (width * 1.0) / activeBins;
            
            // The canvas padding boundary to ensure peaks stay cleanly contained
            const absoluteMaxHeight = height * 0.85; 
            
            let x = 0;

            for (let i = 0; i < activeBins; i++) {
                // Return to smoother interpolation for a liquid waveform aesthetic
                smoothedValues[i] = smoothedValues[i] * 0.6 + freqData[i] * 0.4;
                
                const normalized = smoothedValues[i] / 255.0; 
                
                // Keep the highs visible, but let the extreme lows map 1:1 so their natural peak is preserved
                const freqProgress = i / activeBins;
                const splitScale = freqProgress < 0.5 
                    ? 1.0  // Lows act purely on the FFT curve
                    : 1.0 + (freqProgress * 0.6); // Highs smoothly boosted
                    
                // Apply a natural power curve to suppress background noise and define the actual transients
                const v = Math.pow(normalized, 1.4) * splitScale; 
                
                // Project base scaling without extreme explosive burst multipliers
                const projectedHeight = v * height * 0.75;
                
                // Asymptotically compress the peak into the 85% container boundary.
                // This guarantees rounded, contained peaks rather than chopped flatlines.
                const containedHeight = absoluteMaxHeight * (1 - Math.exp(-projectedHeight / (absoluteMaxHeight * 0.55)));
                
                const y = height - containedHeight;

                ctx.lineTo(x, y);

                x += sliceWidth;
            }

            // Bring path to bottom right to close the fill
            ctx.lineTo(width, height);
            ctx.closePath();

            // Glow logic
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'rgba(6, 182, 212, 0.4)';
            
            // Paint gradient fill underneath the frequency line
            ctx.fill();
            // Paint the solid glowing frequency line contour
            ctx.stroke();

            animationRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', updateDimensions);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isPlaying]);

    return (
        <canvas 
            ref={canvasRef} 
            className="absolute bottom-0 left-0 w-full h-[88px] sm:h-20 pointer-events-none z-0 mix-blend-screen opacity-[0.25] sm:opacity-[0.35] -scale-x-100"
            style={{ filter: 'contrast(1.2)' }}
        />
    );
});

const StickyPlayer = memo(function StickyPlayer() {
    const isPlaying = useAudioStore(state => state.isPlaying);
    const currentTrack = useAudioStore(state => state.currentTrack);
    const playlist = useAudioStore(state => state.playlist);
    const isShuffleToggle = useAudioStore(state => state.isShuffleToggle);

    const togglePlay = useAudioStore(state => state.togglePlay);
    const nextTrack = useAudioStore(state => state.nextTrack);
    const prevTrack = useAudioStore(state => state.prevTrack);
    const toggleShuffle = useAudioStore(state => state.toggleShuffle);
    
    const setCurrentTrack = useAudioStore(state => state.setCurrentTrack);
    const setIsPlaying = useAudioStore(state => state.setIsPlaying);

    const handlePlayPause = () => {
        if (!currentTrack?.src) {
            if (playlist && playlist.length > 0) {
                const randomSeed = Math.floor(Math.random() * playlist.length);
                setCurrentTrack(playlist[randomSeed]);
            } else {
                setCurrentTrack({
                   id: 'sys-boot',
                   title: 'NEURAL HANDSHAKE',
                   producer: 'THE ARCHITECT',
                   src: '/trip.mp3'
                });
            }
            setIsPlaying(true);
            return;
        }
        togglePlay();
    };

    const handleStop = () => {
        if (audioRef) {
            audioRef.pause();
            audioRef.currentTime = 0;
        }
        setIsPlaying(false);
        setCurrentTrack(null);
    };

    return (
        <div className="fixed bottom-0 left-0 w-full z-[200000] pointer-events-auto bg-black/90 backdrop-blur-3xl border-t border-white/5 h-[88px] sm:h-20 flex items-center justify-between px-4 md:px-12 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_40px_rgba(0,0,0,0.8)] crevice-pulse">
            
            <div className="absolute inset-0 z-0 pointer-events-none">
                <FrequencyLine isPlaying={isPlaying} />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(var(--color-primary),0.02),rgba(var(--color-primary),0.01),rgba(var(--color-primary),0.02))] z-10 bg-[length:100%_2px,3px_100%] opacity-20" />
            </div>

            <ProgressBar />

            {/* Left: Track Info & Tactical Visualizer */}
            <div className="flex items-center gap-4 md:gap-8 flex-1 min-w-0 pr-4 relative z-10">
                <div className="relative group shrink-0">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-black border-2 border-primary/20 flex items-center justify-center relative overflow-hidden shadow-[0_0_20px_rgba(var(--color-primary),0.1)] group-hover:border-primary/60 transition-all duration-500"
                         style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)' }}>
                        <div 
                            className="absolute bottom-0 left-0 w-full transition-all duration-150 opacity-30"
                            style={{ height: `calc(var(--audio-intensity, 0) * 100%)`, backgroundColor: 'rgb(var(--color-primary))' }}
                        ></div>
                        <Database size={24} className={`z-10 transition-all duration-500 ${isPlaying ? 'text-primary scale-110' : 'text-primary/40'}`} />
                        <div className="absolute inset-x-0 top-0 h-[1px] bg-primary/40 animate-scan-slow opacity-50" />
                    </div>
                    {/* Floating HUD Bit */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-primary/60" />
                </div>
                
                <div className="flex flex-col min-w-0 justify-center">
                    <div className="flex items-center gap-3">
                        <span className="font-bebas text-2xl md:text-4xl text-white tracking-[0.05em] truncate leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                            {currentTrack?.title || 'BOOT_SEQUENCE'}
                        </span>
                        {isPlaying && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--color-primary),0.8)]" />}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-1.5">
                        <span className="font-mono text-[9px] md:text-[10px] text-primary/60 tracking-[0.4em] uppercase font-black truncate">
                            {currentTrack?.producer || 'THE_ARCHITECT'}
                        </span>
                        <div className="hidden sm:flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-white/10" />
                            <span className="font-mono text-[8px] text-gray-500 tracking-widest uppercase italic">Neural_Link_OK</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Center: Triple-A Gaming Controls */}
            <div className="flex items-center gap-4 sm:gap-10 lg:gap-14 justify-center shrink-0 relative z-10">
                <div className="hidden lg:block">
                    <AudioTimer />
                </div>

                <div className="flex items-center gap-3 sm:gap-6">
                    <button 
                        onClick={toggleShuffle} 
                        className={`transition-all duration-500 hidden md:flex items-center justify-center w-11 h-11 rounded-lg border-2 ${isShuffleToggle ? 'bg-primary/10 text-primary border-primary shadow-[0_0_15px_rgba(var(--color-primary),0.3)]' : 'bg-transparent text-white/30 border-white/5 hover:text-white hover:border-white/20'}`}
                        title="RNG Shuffle"
                    >
                        <Shuffle size={18} />
                    </button>
                    
                    <button onClick={prevTrack} className="text-white/40 hover:text-primary transition-all duration-300 hover:scale-110 px-2" title="Previous Node">
                        <SkipBack size={24} className="fill-current" />
                    </button>
                    
                    <div className="relative group">
                        <div className={`absolute -inset-4 bg-primary/20 blur-2xl rounded-full transition-opacity duration-700 ${isPlaying ? 'opacity-100' : 'opacity-0'}`} />
                        <button 
                            onClick={handlePlayPause} 
                            className="w-14 h-14 md:w-16 md:h-16 bg-primary text-black rounded-full flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-90 shadow-[0_0_25px_rgba(var(--color-primary),0.4)] relative z-10 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
                            {isPlaying ? <Pause size={28} className="fill-current" /> : <Play size={28} className="fill-current ml-1" />}
                        </button>
                    </div>

                    <button onClick={nextTrack} className="text-white/40 hover:text-primary transition-all duration-300 hover:scale-110 px-2" title="Next Node">
                        <SkipForward size={24} className="fill-current" />
                    </button>
                    
                    <button onClick={handleStop} className="text-white/20 hover:text-red-500 transition-all duration-300 hidden md:block" title="Kill System">
                        <Square size={16} />
                    </button>
                </div>
            </div>

            {/* Right: Tactical Metrics */}
            <div className="hidden md:flex flex-1 justify-end items-center gap-8 relative z-10">
                <div className="flex flex-col items-end gap-1.5">
                    <div className="flex gap-1">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className={`w-3 h-1 ${i < 3 ? 'bg-primary/40' : 'bg-white/5'}`} />
                        ))}
                    </div>
                    <span className="font-mono text-[8px] text-primary/40 tracking-[0.2em] font-black uppercase italic">D_Stream: Active</span>
                </div>
                <VolumeControl />
            </div>
            
        </div>
    );
});

export default StickyPlayer;
