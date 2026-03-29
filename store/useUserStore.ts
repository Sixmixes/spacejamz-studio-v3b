import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
  role?: string;
  joinedAt?: any;
  coinsBalance?: number;
  lastCoinRefill?: string;
  xp?: number;
  prestige_level?: number;
  enhancements?: string[];
  ownedEnhancements?: string[];
  customBannerUrl?: string; // Cinematic Private Matrix Banner
  freeGenerationsRemaining?: number; // Founder Neural Stipend
}

export type UserLoadState = 'IDLE' | 'LOADING' | 'AUTHENTICATED' | 'UNAUTHENTICATED';

interface UserState {
  currentUser: UserProfile | null;
  isArchitect: boolean;
  userLoadState: UserLoadState;
  passiveXpTrigger: number;
  
  // Actions
  setCurrentUser: (user: UserProfile | null) => void;
  setUser: (user: Partial<UserProfile>) => void;
  setIsArchitect: (isArchitect: boolean) => void;
  setUserLoadState: (state: UserLoadState) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: null,
      isArchitect: false,
      userLoadState: 'IDLE',
      passiveXpTrigger: 0,

      setCurrentUser: (user) => set({ currentUser: user }),
      setUser: (partialUser) => set((state) => ({ 
          currentUser: state.currentUser ? { ...state.currentUser, ...partialUser } : null 
      })),
      setIsArchitect: (isArchitect) => set({ isArchitect }),
      setUserLoadState: (state) => set({ userLoadState: state }),
      
      logout: () => set({ 
          currentUser: null, 
          isArchitect: false, 
          userLoadState: 'UNAUTHENTICATED' 
      }),
    }),
    {
      name: 'sjs_user_store',
      partialize: (state) => ({ 
          currentUser: state.currentUser, 
          isArchitect: state.isArchitect 
      }),
    }
  )
);
