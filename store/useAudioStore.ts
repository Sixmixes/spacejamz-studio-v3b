import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Track {
  id?: string;
  name?: string | null;
  title?: string;
  src?: string | null;
  producer?: string;
  theme?: string;
  energyMap?: any;
  lufsVersion?: number;
  maxPeak?: number;
  meanEnergy?: number;
  bpm?: number;
  key?: string;
  normalizationGain?: number;
}

interface AudioState {
  playlist: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  isShuffleToggle: boolean;
  shuffledQueue: string[]; // Holds track IDs for no-duplicate randomization
  queueIndex: number;
  volume: number;
  isMuted: boolean;
  isArchitect: boolean; // Handled natively in the Engine
  reactivitySensitivity: number;
  reactivityThreshold: number;
  targetFrequency: 'bass' | 'mid' | 'high' | 'all';
  analyzerMode: 'default' | 'high' | 'extreme';
  
  // Actions
  setPlaylist: (tracks: Track[]) => void;
  addToPlaylist: (track: Track) => void;
  removeFromPlaylist: (trackId: string) => void;
  setCurrentTrack: (track: Track | null) => void;
  setIsPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  toggleShuffle: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  shuffleArray: () => void;
  moveTrack: (fromIndex: number, toIndex: number | 'up' | 'down') => void;
  setIsArchitect: (isArchitect: boolean) => void;
  setReactivitySensitivity: (sens: number) => void;
  setReactivityThreshold: (threshold: number) => void;
  setTargetFrequency: (freq: 'bass' | 'mid' | 'high' | 'all') => void;
  setAnalyzerMode: (mode: 'default' | 'high' | 'extreme') => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      playlist: [],
      currentTrack: null,
      isPlaying: false,
      isShuffleToggle: false,
      shuffledQueue: [],
      queueIndex: 0,
      volume: 1,
      isMuted: false,
      isArchitect: false,
      reactivitySensitivity: 1.0,
      reactivityThreshold: 0.08, // Lowered for more explosive baseline tracking
      targetFrequency: 'all',
      analyzerMode: 'default',

      setPlaylist: (tracks) => set((state) => {
        // Only reshuffle if we are active and completely replacing
        const ids = tracks.map(t => t.id as string);
        return { playlist: tracks, shuffledQueue: state.isShuffleToggle ? ids.sort(() => Math.random() - 0.5) : [] };
      }),
      addToPlaylist: (track) => set((state) => ({ 
        playlist: [track, ...state.playlist],
        shuffledQueue: state.isShuffleToggle && track.id ? [...state.shuffledQueue, track.id] : state.shuffledQueue
      })),
      removeFromPlaylist: (trackId) => set((state) => {
        const newPlaylist = state.playlist.filter((t) => t.id !== trackId);
        const shouldStop = state.currentTrack?.id === trackId;
        return { 
          playlist: newPlaylist,
          shuffledQueue: state.shuffledQueue.filter(id => id !== trackId),
          ...(shouldStop ? { isPlaying: false, currentTrack: null } : {})
        };
      }),
      setCurrentTrack: (track) => set((state) => {
        // If we jump to a track manually while shuffled, we want it to guide the queue
        if (state.isShuffleToggle && track?.id) {
            return { currentTrack: track, queueIndex: Math.max(0, state.shuffledQueue.indexOf(track.id)) };
        }
        return { currentTrack: track };
      }),
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      toggleShuffle: () => set((state) => {
        const newShuffleState = !state.isShuffleToggle;
        if (newShuffleState) {
          // Engage Smart Shuffle
          let ids = state.playlist.map(t => t.id as string);
          // If a track is already playing, put it at front so we don't repeat immediately
          if (state.currentTrack?.id) {
            ids = ids.filter(id => id !== state.currentTrack!.id);
            for (let i = ids.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [ids[i], ids[j]] = [ids[j], ids[i]];
            }
            ids.unshift(state.currentTrack.id);
          } else {
            for (let i = ids.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [ids[i], ids[j]] = [ids[j], ids[i]];
            }
          }
          return { isShuffleToggle: true, shuffledQueue: ids, queueIndex: state.currentTrack ? 0 : -1 };
        }
        return { isShuffleToggle: false, shuffledQueue: [], queueIndex: 0 };
      }),
      setVolume: (vol) => set({ volume: vol }),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      
      nextTrack: () => {
        const state = get();
        if (state.playlist.length === 0) return;
        
        if (state.isShuffleToggle && state.shuffledQueue.length > 0) {
          let nextIdx = state.queueIndex + 1;
          
          if (nextIdx >= state.shuffledQueue.length) {
            // Re-shuffle the deck
            let ids = [...state.shuffledQueue];
            for (let i = ids.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [ids[i], ids[j]] = [ids[j], ids[i]];
            }
            set({ shuffledQueue: ids, queueIndex: 0 });
            nextIdx = 0;
            const targetTrack = state.playlist.find(t => t.id === ids[nextIdx]);
            if (targetTrack) set({ currentTrack: targetTrack });
          } else {
            set({ queueIndex: nextIdx });
            const targetTrack = state.playlist.find(t => t.id === state.shuffledQueue[nextIdx]);
            if (targetTrack) set({ currentTrack: targetTrack });
          }
        } else {
          const idx = state.playlist.findIndex((t) => t.id === state.currentTrack?.id);
          const nextIdx = (idx + 1) % state.playlist.length;
          set({ currentTrack: state.playlist[nextIdx] });
        }
      },
      prevTrack: () => {
        const state = get();
        if (state.playlist.length === 0) return;
        
        if (state.isShuffleToggle && state.shuffledQueue.length > 0) {
          let prevIdx = state.queueIndex - 1;
          if (prevIdx < 0) prevIdx = state.shuffledQueue.length - 1;
          set({ queueIndex: prevIdx });
          const targetTrack = state.playlist.find(t => t.id === state.shuffledQueue[prevIdx]);
          if (targetTrack) set({ currentTrack: targetTrack });
        } else {
          const idx = state.playlist.findIndex((t) => t.id === state.currentTrack?.id);
          const prevIdx = idx <= 0 ? state.playlist.length - 1 : idx - 1;
          set({ currentTrack: state.playlist[prevIdx] });
        }
      },
      shuffleArray: () => {
        set((state) => {
          const newArr = [...state.playlist];
          for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
          }
          return { playlist: newArr };
        });
      },
      moveTrack: (fromIndex, toIndex) => {
        set((state) => {
          const newArr = [...state.playlist];
          const to = typeof toIndex === 'string' ? (toIndex === 'up' ? fromIndex - 1 : fromIndex + 1) : toIndex;
          if (to < 0 || to >= newArr.length || fromIndex === to) return { playlist: newArr };
          
          const [movedItem] = newArr.splice(fromIndex, 1);
          newArr.splice(to, 0, movedItem);
          return { playlist: newArr };
        });
      },
      setIsArchitect: (isArchitect) => set({ isArchitect }),
      setReactivitySensitivity: (sens) => set({ reactivitySensitivity: sens }),
      setReactivityThreshold: (threshold) => set({ reactivityThreshold: threshold }),
      setTargetFrequency: (freq) => set({ targetFrequency: freq }),
      setAnalyzerMode: (mode) => set({ analyzerMode: mode })
    }),
    {
      name: 'sjs_audio_store',
      // only persist things we want to survive refresh
      partialize: (state) => ({ 
        volume: state.volume, 
        playlist: state.playlist.filter(t => !t.src?.startsWith('blob:')) 
      })
    }
  )
);
