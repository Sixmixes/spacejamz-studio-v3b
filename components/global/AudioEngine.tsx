'use client';
import { useEffect, useRef } from 'react';
import { useAudioStore } from '@/store/useAudioStore';
import { useUserStore } from '@/store/useUserStore';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Create singleton references outside React tree for raw DOM audio analysis (preventing render thrash)
export const audioRef = typeof window !== 'undefined' ? new Audio() : null;
if (audioRef) {
    audioRef.crossOrigin = "anonymous";
    (audioRef as any).playsInline = true;
    (audioRef as any).webkitPlaysInline = true;
}
export const analyserRef = { current: null as AnalyserNode | null };
export const coreAudioData = { current: { intensity: 0, low: 0, mid: 0, high: 0 } };

let isAudioInitialized = false;
let globalAudioContext: AudioContext | null = null;

export default function AudioEngine() {
  const currentTrack = useAudioStore(state => state.currentTrack);
  const isPlaying = useAudioStore(state => state.isPlaying);
  const volume = useAudioStore(state => state.volume);
  const isMuted = useAudioStore(state => state.isMuted);
  const setIsPlaying = useAudioStore(state => state.setIsPlaying);
  const setPlaylist = useAudioStore(state => state.setPlaylist);
  const reactivitySensitivity = useAudioStore(state => state.reactivitySensitivity);
  const reactivityThreshold = useAudioStore(state => state.reactivityThreshold);
  const analyzerMode = useAudioStore(state => state.analyzerMode);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastAssignedSrc = useRef<string | null>(null);
  const lastAnimFrame = useRef<number>(0);

  // 0. Attach detached Native Audio to the DOM (Bypasses iOS Safari Lock-Screen GC Suspension)
  useEffect(() => {
    if (audioRef && !document.getElementById('spacejamz-audio-core')) {
        audioRef.id = 'spacejamz-audio-core';
        audioRef.style.display = 'none';
        document.body.appendChild(audioRef);
    }
  }, []);

  // 0.5 NETWORK SYNC: Attach to the Neural Audio Gateway Database configurations
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, 'config', 'global_audio'), (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const state = useAudioStore.getState();
            
            // Sync Master Playlist
            if (data.playlist && Array.isArray(data.playlist)) {
                setPlaylist(data.playlist);
                // If player is idle or holding dummy boot track, inject the true head of the queue
                if (!state.currentTrack || state.currentTrack.id === 'sys-boot') {
                    if (data.playlist.length > 0) {
                        state.setCurrentTrack(data.playlist[0]);
                    }
                }
            }
            
            // Sync DSP Analysis Tunings
            if (data.reactivitySensitivity !== undefined) state.setReactivitySensitivity(data.reactivitySensitivity);
            if (data.reactivityThreshold !== undefined) state.setReactivityThreshold(data.reactivityThreshold);
            if (data.targetFrequency) state.setTargetFrequency(data.targetFrequency);
            if (data.analyzerMode) state.setAnalyzerMode(data.analyzerMode);
        }
    });

    return () => unsub();
  }, [setPlaylist]);

  // 1. Initialize Web Audio API once on first interaction to unlock DSP
  useEffect(() => {
    if (!audioRef) return;
    
    const initAudio = () => {
      if (isAudioInitialized && globalAudioContext) {
          if (globalAudioContext.state === 'suspended') globalAudioContext.resume();
          return;
      }
      if (isAudioInitialized) return;
      isAudioInitialized = true;
      
      try {
          const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
          globalAudioContext = new AudioContextCtor();
          const analyser = globalAudioContext.createAnalyser();
          analyser.fftSize = 2048;
          analyserRef.current = analyser;
          
          const source = globalAudioContext.createMediaElementSource(audioRef);
          const dynamicGain = globalAudioContext.createGain();
          
          // Route completely through offline static normalization gateway to balance both headphones and visual peaks
          source.connect(dynamicGain);
          dynamicGain.connect(globalAudioContext.destination);
          dynamicGain.connect(analyser);
          
          gainNodeRef.current = dynamicGain;
          audioContextRef.current = globalAudioContext;
          if (globalAudioContext.state === 'suspended') {
              globalAudioContext.resume();
          }
      } catch (e) {
          console.error("DSP Context Error:", e);
      }
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (e.repeat) return; // Prevent hold-to-repeat rapid toggling

        const active = document.activeElement;
        const isTyping = active instanceof HTMLInputElement || 
                         active instanceof HTMLTextAreaElement || 
                         (active as HTMLElement)?.isContentEditable;
        const isButton = active?.tagName === 'BUTTON' || active?.getAttribute('role') === 'button';
        
        if (!isTyping) {
          if (isButton) return;
          e.preventDefault();

          const state = useAudioStore.getState();
          if (!state.currentTrack?.src) {
              const playlist = state.playlist;
              if (playlist && playlist.length > 0) {
                  state.setCurrentTrack(playlist[0]);
              } else {
                  state.setCurrentTrack({
                     id: 'sys-boot',
                     title: 'NEURAL HANDSHAKE',
                     producer: 'THE ARCHITECT',
                     src: '/trip.mp3'
                  });
              }
              state.setIsPlaying(true);
          } else {
              state.togglePlay();
          }
        }
      }
    };

    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('keydown', initAudio, { once: true });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 1.5. Sync state to native Audio Element
  useEffect(() => {
    if (!audioRef) return;
    audioRef.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // 2. Unified Track & Playback Sync Engine
  useEffect(() => {
    if (!audioRef) return;

    let srcChanged = false;

    if (currentTrack?.src && lastAssignedSrc.current !== currentTrack.src) {
      audioRef.src = currentTrack.src;
      lastAssignedSrc.current = currentTrack.src;
      audioRef.load();
      srcChanged = true;
      
      // Engage the offline static LUFS Normalization instantly when the track loads
      if (gainNodeRef.current && globalAudioContext) {
          const staticLufsGain = currentTrack.normalizationGain || 1.0;
          gainNodeRef.current.gain.setValueAtTime(staticLufsGain, globalAudioContext.currentTime);
      }
    } else if (!currentTrack) {
      audioRef.pause();
      audioRef.currentTime = 0;
      audioRef.src = '';
      lastAssignedSrc.current = null;
      srcChanged = true;
    }

    if (isPlaying) {
      if (audioRef.paused || srcChanged) {
        const playPromise = audioRef.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.warn("Autoplay blocked:", e);
            setIsPlaying(false);
          });
        }
      }
    } else {
      if (!audioRef.paused) {
        audioRef.pause();
      }
    }
  }, [currentTrack, isPlaying, setIsPlaying]);

  useEffect(() => {
      if (!audioRef) return;
      const handleEnded = () => {
          useAudioStore.getState().nextTrack();
      };
      audioRef.addEventListener('ended', handleEnded);
      return () => audioRef.removeEventListener('ended', handleEnded);
  }, []);

  // 3. Dynamic Analyzer Reactivity Mode Injection
  useEffect(() => {
      if (!analyserRef.current) return;
      if (analyzerMode === 'extreme') {
          analyserRef.current.fftSize = 8192;
          analyserRef.current.smoothingTimeConstant = 0.85;
      } else if (analyzerMode === 'high') {
          analyserRef.current.fftSize = 4096;
          analyserRef.current.smoothingTimeConstant = 0.8;
      } else {
          analyserRef.current.fftSize = 2048;
          analyserRef.current.smoothingTimeConstant = 0.8;
      }
  }, [analyzerMode]);

  // 5. High-performance analyzer WebGL loop (ported from V2)
  useEffect(() => {
    let dataArray: Uint8Array | null = null;
    const TARGET_FPS = 30;
    const THROTTLE_MS = 1000 / TARGET_FPS;
    const DELTA_THRESHOLD = 0.01; // 1% change gating
    const lastPushed = { intensity: 0, low: 0, mid: 0, high: 0 };
    let rollingLufs = 0.15;
    let lastUpdate = 0;
    
    // Scale FFT for mobile to save DSP cycles
    if (typeof window !== 'undefined' && window.innerWidth < 768 && analyserRef.current) {
        analyserRef.current.fftSize = 1024;
    }

    const analyseAudio = (time: number) => {
      if (isPlaying && analyserRef.current) {
        if (!dataArray) {
            dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        }

        if (time - lastAnimFrame.current < THROTTLE_MS) {
            animationRef.current = requestAnimationFrame(analyseAudio);
            return;
        }
        lastAnimFrame.current = time;
        analyserRef.current.getByteFrequencyData(dataArray as any);

        let bassSum = 0, midSum = 0, highSum = 0;
        
        // REFINED, ZERO-PHASE FREQUENCY MAPPING (44.1kHz / 2048 FFT = ~21.5Hz per bin)
        
        // 1. Deep Punch/Impact (60Hz–200Hz): Core Kick/Bass without the muddy <60Hz rumble
        // Bins 3-9
        for (let i = 3; i < 10; i++) bassSum += dataArray[i];      
        
        // 2. Rhythmic "Punch" (200Hz–500Hz): Solid body/warmth, avoids muddy motion
        // Bins 10-23
        for (let i = 10; i < 24; i++) midSum += dataArray[i];     
        
        // 3. The "Clarity/Click" Zone (2kHz–6kHz): Bright movements, snare hits, vocals
        // Bins 93-279
        for (let i = 93; i < 280; i++) highSum += dataArray[i];   

        const currentLow = (bassSum / 7) / 255;
        const currentMid = (midSum / 14) / 255;
        const currentHigh = (highSum / 187) / 255;

        // Calculates rolling LUFS strictly for visual metric reporting (no longer mutating physical gain)
        const instantEnergy = (currentLow * 0.45) + (currentMid * 0.5) + (currentHigh * 0.05);
        rollingLufs = (rollingLufs * 0.995) + (instantEnergy * 0.005);

        // 2. FREQUENCY BAND TARGETING
        const liveState = useAudioStore.getState();
        const targetFreq = liveState.targetFrequency;
        
        // Use a simple ternary or pre-calculated impact to save cycles
        const freqImpact = targetFreq === 'bass' ? currentLow 
                         : targetFreq === 'mid'  ? currentMid 
                         : targetFreq === 'high' ? currentHigh 
                         : (currentLow * 1.5 + currentMid * 0.6 + currentHigh * 0.4) / 2.5;

        // 3. TRANSIENT EMISSION (The visual hit)
        const impactEnergy = freqImpact;
        const liveThreshold = liveState.reactivityThreshold;
        
        let overallIntensity = 0;
        
        // Export RAW SIGNAL exactly as the engine hears it, mapped only by user sensitivity
        const rawSignal = Math.min(1.0, Math.max(0, impactEnergy * 2.5));
        document.documentElement.style.setProperty('--audio-signal-raw', rawSignal.toString());
        
        // The gate is now strictly the user's manual threshold. No more adaptive "fading away".
        if (impactEnergy > liveThreshold) {
            const transient = impactEnergy - liveThreshold;
            // Snappy power curve, multiplied instantly by user sensitivity
            const expanded = Math.pow(transient * 3.0, 1.8);
            overallIntensity = expanded * liveState.reactivitySensitivity; 
        }

        overallIntensity = Math.min(1.0, Math.max(0, overallIntensity));
        
        // Erase the old Auto-Gain LUFS multiplier and hand 100% control back to the user
        const finalMultiplicationGate = liveState.reactivitySensitivity * 2.5; 
        
        const normalizedLow = Math.min(1.0, currentLow * finalMultiplicationGate);
        const normalizedMid = Math.min(1.0, currentMid * finalMultiplicationGate);
        const normalizedHigh = Math.min(1.0, currentHigh * finalMultiplicationGate);

        // DELTA-GATED CSS DISPATCH (Only update DOM if signal shifts significantly)
        if (Math.abs(lastPushed.intensity - overallIntensity) > DELTA_THRESHOLD) {
            document.documentElement.style.setProperty('--audio-intensity', overallIntensity.toString());
            lastPushed.intensity = overallIntensity;
        }
        if (Math.abs(lastPushed.low - normalizedLow) > DELTA_THRESHOLD) {
            document.documentElement.style.setProperty('--audio-low', normalizedLow.toString());
            document.documentElement.style.setProperty('--bass-kick', normalizedLow.toString());
            lastPushed.low = normalizedLow;
        }
        if (Math.abs(lastPushed.mid - normalizedMid) > DELTA_THRESHOLD) {
            document.documentElement.style.setProperty('--audio-mid', normalizedMid.toString());
            lastPushed.mid = normalizedMid;
        }
        if (Math.abs(lastPushed.high - normalizedHigh) > DELTA_THRESHOLD) {
            document.documentElement.style.setProperty('--audio-high', normalizedHigh.toString());
            lastPushed.high = normalizedHigh;
        }

        coreAudioData.current.intensity = overallIntensity;
        coreAudioData.current.low = normalizedLow;
        coreAudioData.current.mid = normalizedMid;
        coreAudioData.current.high = normalizedHigh;

        if (!time || time - lastUpdate > 100) {
            lastUpdate = time || performance.now();
        }
      }
      
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(analyseAudio);
      } else {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      }
    };

    analyseAudio(performance.now());

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, reactivitySensitivity, reactivityThreshold]);

  return null;
}
