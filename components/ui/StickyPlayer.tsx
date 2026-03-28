'use client';

import React, { useState, useEffect, memo } from 'react';
import { Play, Square, Pause, Shuffle, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
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
                  background: `linear-gradient(to right, rgb(6,182,212) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) ${(isMuted ? 0 : volume) * 100}%)`
                }}
            />
        </div>
    );
});

const MINIMAP_MULTS = [0.85, 0.32, 0.94, 0.51, 0.27, 0.76, 0.43, 0.88, 0.35, 0.62, 0.91, 0.47, 0.73, 0.22, 0.81, 0.55];

const AudioMinimap = memo(({ isPlaying }: { isPlaying: boolean }) => {
    return (
        <div className="flex justify-end gap-[3px] h-6 items-end">
            {[...Array(16)].map((_, i) => (
                <div 
                    key={i} 
                    className="w-1.5 bg-primary/60 rounded-t-sm origin-bottom"
                    style={{ 
                        '--random-mult': MINIMAP_MULTS[i],
                        height: '100%',
                        transform: isPlaying ? `scaleY(calc(0.1 + (var(--audio-intensity, 0) * var(--random-mult) * 0.9)))` : 'scaleY(0.1)',
                        opacity: isPlaying ? 1 : 0.2
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

const StickyPlayer = () => {
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
        <div className="fixed bottom-0 left-0 w-full z-[99999] bg-black/85 backdrop-blur-2xl border-t border-white/5 h-[88px] sm:h-20 flex items-center justify-between pl-4 pr-4 md:px-12 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] crevice-pulse">
            
            <FrequencyLine isPlaying={isPlaying} />
            <ProgressBar />

            {/* Left: Track Info */}
            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 md:w-1/3 pr-2 md:pr-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center relative overflow-hidden shrink-0 shadow-inner">
                    <div 
                        className="absolute bottom-0 left-0 w-full bg-primary/40 transition-all duration-75"
                        style={{ height: `calc(var(--audio-intensity, 0) * 100%)` }}
                    ></div>
                    <Play size={18} className="text-white/80 z-10" />
                </div>
                <div className="flex flex-col overflow-hidden justify-center h-full pt-1 relative z-10">
                    <span className={`font-mono text-[9px] md:text-[10px] uppercase tracking-[0.2em] ${isPlaying ? 'text-primary drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'text-gray-500'}`}>
                        {isPlaying ? 'TRANSMITTING' : 'STANDBY'}
                    </span>
                    <span className="font-bebas text-lg sm:text-xl md:text-2xl text-white tracking-widest truncate leading-none mt-1" title={currentTrack?.title || 'NO SOURCE LOADED'}>
                        {currentTrack?.title || 'NO SOURCE LOADED'}
                    </span>
                    
                    {/* KEY AND BPM METADATA COMPONENT */}
                    {(currentTrack?.bpm || currentTrack?.key) && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                            {currentTrack.bpm && (
                                <span className="font-mono text-[8px] md:text-[9px] text-white/80 border border-white/20 bg-white/5 px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(255,255,255,0.05)] uppercase tracking-wider backdrop-blur-sm">
                                    {currentTrack.bpm} BPM
                                </span>
                            )}
                            {currentTrack.key && (
                                <span className="font-mono text-[8px] md:text-[9px] text-cyan-400 border border-cyan-500/30 bg-cyan-900/30 px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(6,182,212,0.15)] tracking-wider backdrop-blur-sm">
                                    {currentTrack.key}
                                </span>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="ml-auto hidden xl:flex">
                    <AudioTimer />
                </div>
            </div>

            {/* Center: Controls */}
            <div className="flex items-center gap-3 sm:gap-4 md:gap-8 justify-end md:justify-center w-auto md:w-1/3 shrink-0">
                <button 
                    onClick={toggleShuffle} 
                    className={`transition-colors hidden md:flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full ${isShuffleToggle ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'text-gray-300 hover:text-white'}`} 
                    title={isShuffleToggle ? "True RNG Shuffle: ON" : "True RNG Shuffle: OFF"}
                >
                    <Shuffle size={18} />
                </button>
                <button onClick={prevTrack} className="text-gray-200 hover:text-white transition-colors hidden sm:flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full drop-shadow-md" title="Previous Track">
                    <SkipBack size={20} />
                </button>
                
                <button 
                    onClick={handlePlayPause}
                    className={`min-w-[48px] min-h-[48px] md:w-14 md:h-14 rounded-full shrink-0 flex items-center justify-center transition-all duration-75 relative z-10 ${isPlaying ? 'bg-cyan-500 text-black' : 'bg-white text-black hover:bg-gray-200'}`}
                >
                    {/* Hardware Accelerated Glow Wrapper */}
                    {isPlaying && (
                        <div 
                            className="absolute inset-0 rounded-full bg-cyan-500 pointer-events-none z-[-1]"
                            style={{ 
                                boxShadow: `0 0 30px rgba(6, 182, 212, 1)`,
                                opacity: `calc(0.4 + (var(--audio-intensity, 0) * 0.6))`,
                                // Removed scaling to keep UI perfectly static
                            }}
                        />
                    )}
                    <div className="relative z-10 flex items-center justify-center">
                        {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={22} className="fill-current ml-1" />}
                    </div>
                </button>
                
                <button onClick={handleStop} className="text-gray-200 hover:text-red-500 transition-colors hidden md:flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full drop-shadow-md" title="Kill Audio Engine">
                    <Square size={16} />
                </button>
                <button onClick={nextTrack} className="text-gray-200 hover:text-white transition-colors flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full drop-shadow-md" title="Next Track">
                    <SkipForward size={20} />
                </button>
            </div>

            {/* Right: Audio Reactor Minimap & Volume */}
            <div className="hidden md:flex w-1/3 justify-between items-center pl-4 lg:pl-12 pr-2">
                <VolumeControl />
                <div className="hidden lg:block">
                    <AudioMinimap isPlaying={isPlaying} />
                </div>
            </div>
            
        </div>
    );
};

export default StickyPlayer;
