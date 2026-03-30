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
        <div className="flex items-center justify-center w-full gap-2">
            <span className="text-[11px] font-medium text-gray-400 font-mono w-8 text-right">
                {formatTime(progress)}
            </span>
            <input 
                type="range" 
                min={0} 
                max={duration || 100} 
                step="0.1"
                value={progress || 0} 
                onChange={handleSeek}
                className="w-full h-1 hover:h-1.5 opacity-80 hover:opacity-100 appearance-none cursor-pointer focus:outline-none transition-all duration-200 rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-0 hover:[&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                style={{
                  background: `linear-gradient(to right, white ${((progress || 0) / (duration || 1)) * 100}%, rgba(255,255,255,0.2) ${((progress || 0) / (duration || 1)) * 100}%)`
                }}
                title="Seek Track"
            />
            <span className="text-[11px] font-medium text-gray-400 font-mono w-8 text-left">
                {formatTime(duration)}
            </span>
        </div>
    );
});

// Helper for MM:SS
const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
};

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
        <div className="fixed bottom-0 left-0 w-full z-[200000] pointer-events-auto bg-[#121212] border-t border-white/5 h-[90px] flex items-center justify-between px-4 pb-[env(safe-area-inset-bottom)]">
            
            {/* Left: Track Info & Album Art */}
            <div className="flex items-center gap-3 w-1/3 min-w-0 pr-4 relative z-10">
                <div className="relative group shrink-0 w-14 h-14 bg-black/40 rounded-md overflow-hidden flex items-center justify-center">
                   {/* Fallback Audio Visual or Album Art */}
                   <img 
                       src="/api/neural-assets?node=FINANCE&pilot=system" 
                       alt="cover" 
                       className="absolute inset-0 w-full h-full object-cover opacity-60" 
                       onError={(e) => { e.currentTarget.style.display = 'none'; }}
                   />
                </div>
                
                <div className="flex flex-col min-w-0 justify-center">
                    <span className="text-sm font-semibold text-white tracking-wide truncate hover:underline cursor-pointer">
                        {currentTrack?.title || 'System Standby'}
                    </span>
                    <span className="text-xs text-gray-400 hover:text-white hover:underline cursor-pointer truncate mt-0.5">
                        {currentTrack?.producer || 'SpaceJamz Node'}
                    </span>
                </div>
            </div>

            {/* Center: Triple-A Gaming Controls -> Spotify Core Layout */}
            <div className="flex flex-col items-center justify-center w-1/3 max-w-[700px] shrink-0 relative z-10 gap-2">
                
                <div className="flex items-center gap-6">
                    <button 
                        onClick={toggleShuffle} 
                        className={`transition-colors text-sm ${isShuffleToggle ? 'text-green-500' : 'text-gray-400 hover:text-white'}`}
                        title="Enable shuffle"
                    >
                        <Shuffle size={16} />
                    </button>
                    
                    <button onClick={prevTrack} className="text-gray-400 hover:text-white transition-colors" title="Previous">
                        <SkipBack size={20} className="fill-current" />
                    </button>
                    
                    <button 
                        onClick={handlePlayPause} 
                        className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-lg"
                    >
                        {isPlaying ? <Pause size={16} className="fill-current" /> : <Play size={16} className="fill-current ml-1" />}
                    </button>

                    <button onClick={nextTrack} className="text-gray-400 hover:text-white transition-colors" title="Next">
                        <SkipForward size={20} className="fill-current" />
                    </button>
                    
                    <button onClick={handleStop} className="text-gray-400 hover:text-red-500 transition-colors" title="Stop System">
                        <Square size={16} />
                    </button>
                </div>

                <div className="w-full mt-[-2px] flex items-center">
                    <ProgressBar />
                </div>
            </div>

            {/* Right: Tactical Metrics / Options */}
            <div className="flex w-1/3 justify-end items-center relative z-10 gap-4 right-0">
                <VolumeControl />
            </div>
            
        </div>
    );
});

export default StickyPlayer;
