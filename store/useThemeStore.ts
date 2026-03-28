import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SpaceTheme = 'cosmos' | 'battle' | 'arena' | 'toxic' | 'royal' | 'ghastly' | 'abyss' | 'neon';

interface ThemeState {
    activeTheme: SpaceTheme;
    setTheme: (theme: SpaceTheme) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            activeTheme: 'cosmos',
            setTheme: (theme) => set({ activeTheme: theme }),
        }),
        {
            name: 'sjs_theme_store',
        }
    )
);
