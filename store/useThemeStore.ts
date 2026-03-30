import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SpaceTheme = 
    | 'CYBERDECK_PRIME' 
    | 'ABYSSAL_SINGULARITY' 
    | 'SOLAR_SUPERNOVA' 
    | 'SILICON_GRAVE' 
    | 'SECTOR_7_SYNDICATE' 
    | 'QUANTUM_MATRIX' 
    | 'ZERO_G_ANOMALY' 
    | 'ASTRAL_PROJECTION' 
    | 'LIQUID_CHROME' 
    | 'NEON_DOJO';

interface ThemeState {
    activeTheme: SpaceTheme;
    setTheme: (theme: SpaceTheme) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            activeTheme: 'CYBERDECK_PRIME',
            setTheme: (theme) => set({ activeTheme: theme }),
        }),
        { name: 'spacejamz-world-engine' }
    )
);
