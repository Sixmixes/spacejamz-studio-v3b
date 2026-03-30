'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAudioStore } from '@/store/useAudioStore';

interface ScrambleTextProps {
  text: string;
  className?: string;
  duration?: number;
  scrambleSpeed?: number;
  darken?: boolean;
  syncToAudio?: boolean;
}

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

export function ScrambleText({ 
  text, 
  className = "", 
  duration = 2000, 
  scrambleSpeed = 50,
  darken = false,
  syncToAudio = false
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const isPlaying = useAudioStore(s => syncToAudio ? s.isPlaying : false);
  const bpm = useAudioStore(s => syncToAudio ? s.currentTrack?.bpm : undefined);

  useEffect(() => {
    let iteration = 0;
    
    const startScramble = () => {
        clearInterval(intervalRef.current!);
        
        intervalRef.current = setInterval(() => {
            setDisplayText(prev => 
                text.split("")
                    .map((char, index) => {
                        if (index < iteration) {
                            return text[index];
                        }
                        return characters[Math.floor(Math.random() * characters.length)];
                    })
                    .join("")
            );

            if (iteration >= text.length) {
                clearInterval(intervalRef.current!);
            }

            iteration += 1 / (duration / scrambleSpeed);
        }, scrambleSpeed);
    };

    startScramble();

    return () => clearInterval(intervalRef.current!);
  }, [text, duration, scrambleSpeed]);

  useEffect(() => {
      if (!syncToAudio || !isPlaying || !bpm) return;

      let rafId: number;
      let lastBeatIndex = -1;
      let glitchActive = false;
      let currentGlitchIndex = -1;
      
      const mountTime = Date.now();
      let pauseEndTime = 0;

      const getAudioCore = () => document.getElementById('spacejamz-audio-core') as HTMLAudioElement | null;

      const syncLoop = () => {
          const audioEl = getAudioCore();
          if (!audioEl) {
              rafId = requestAnimationFrame(syncLoop);
              return;
          }

          // Force a 6-second delay after the initial intro scramble finishes before starting rhythmic glitches
          if (Date.now() - mountTime < 6000) {
              rafId = requestAnimationFrame(syncLoop);
              return;
          }

          const currentTime = audioEl.currentTime;

          // Occasionally trigger a massive 3-second cinematic pause
          if (currentTime > pauseEndTime && Math.random() < 0.002) {
              pauseEndTime = currentTime + 3.0; // Pause for 3 seconds of track time
          }

          // If we are currently paused, skip cryptographic generation
          if (currentTime < pauseEndTime) {
              rafId = requestAnimationFrame(syncLoop);
              return;
          }

          // TEMPO INTELLIGENCE CORE: Auto-Halftime / Double-Time Algorithm
          let adaptiveBpm = bpm;
          if (adaptiveBpm >= 130) {
              adaptiveBpm = adaptiveBpm / 2;
          } 
          else if (adaptiveBpm <= 65) {
              adaptiveBpm = adaptiveBpm * 2;
          }

          const beatDuration = 60 / adaptiveBpm; 
          const currentBeatIndex = Math.floor(currentTime / beatDuration); 
          const currentBeatPhase = currentTime % beatDuration;

          // HIT EXACTLY ON THE GRID (Transient Attack)
          if (currentBeatIndex > lastBeatIndex) {
              lastBeatIndex = currentBeatIndex;
              
              const randomIndex = Math.floor(Math.random() * text.length);
              if (text[randomIndex] !== ' ') {
                  currentGlitchIndex = randomIndex;
                  glitchActive = true;
                  
                  setDisplayText(prev => {
                      const arr = prev.split('');
                      arr[randomIndex] = characters[Math.floor(Math.random() * characters.length)];
                      return arr.join('');
                  });
              }
          }

          // RESTORE ON OFF-BEAT (Transient Release)
          if (glitchActive && currentBeatPhase > (beatDuration * 0.4) && currentGlitchIndex !== -1) {
              glitchActive = false;
              setDisplayText(prev => {
                  const arr = prev.split('');
                  arr[currentGlitchIndex] = text[currentGlitchIndex];
                  return arr.join('');
              });
          }

          rafId = requestAnimationFrame(syncLoop);
      };

      rafId = requestAnimationFrame(syncLoop);

      return () => cancelAnimationFrame(rafId);
  }, [syncToAudio, isPlaying, bpm, text]);

  return (
    <span 
        className={`${className} transition-opacity duration-1000 ${darken ? 'opacity-20 hover:opacity-100' : 'opacity-100'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
      {displayText}
    </span>
  );
}
