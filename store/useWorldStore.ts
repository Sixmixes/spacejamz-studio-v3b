import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WorldTheme {
    id: string;
    name: string;
    bgCss: string;
    accent: string;
}

export const WORLD_THEMES: Record<string, WorldTheme> = {
    CYBERDECK_PRIME: { 
        id: 'CYBERDECK_PRIME', 
        name: 'Cyberdeck Prime', 
        bgCss: 'radial-gradient(ellipse at center, #1b0a2a 0%, #000000 100%)', 
        accent: '#ff00ff' 
    },
    ABYSSAL_SINGULARITY: { 
        id: 'ABYSSAL_SINGULARITY', 
        name: 'Abyssal Singularity', 
        bgCss: 'radial-gradient(circle at 50% 50%, #15002b 0%, #06000d 50%, #000000 100%)', 
        accent: '#4b0082' 
    },
    SOLAR_SUPERNOVA: { 
        id: 'SOLAR_SUPERNOVA', 
        name: 'Solar Supernova', 
        bgCss: 'radial-gradient(circle at top, #4a0f00 0%, #1a0200 60%, #000000 100%)', 
        accent: '#ff4500' 
    },
    SILICON_GRAVE: { 
        id: 'SILICON_GRAVE', 
        name: 'Silicon Grave', 
        bgCss: 'linear-gradient(to bottom, #2a1205 0%, #0c0500 100%)', 
        accent: '#b7410e' 
    },
    SECTOR_7_SYNDICATE: { 
        id: 'SECTOR_7_SYNDICATE', 
        name: 'Sector 7 Syndicate', 
        bgCss: 'linear-gradient(135deg, #001015 0%, #000510 100%)', 
        accent: '#00ffff' 
    },
    QUANTUM_MATRIX: { 
        id: 'QUANTUM_MATRIX', 
        name: 'Quantum Matrix', 
        bgCss: 'radial-gradient(ellipse at bottom, #001a00 0%, #000500 100%)', 
        accent: '#00ff00' 
    },
    ZERO_G_ANOMALY: { 
        id: 'ZERO_G_ANOMALY', 
        name: 'Zero-G Anomaly', 
        bgCss: 'radial-gradient(circle at center, #1a2025 0%, #050a0f 100%)', 
        accent: '#708090' 
    },
    ASTRAL_PROJECTION: { 
        id: 'ASTRAL_PROJECTION', 
        name: 'Astral Projection', 
        bgCss: 'radial-gradient(ellipse at top right, #111111 0%, #000000 100%)', 
        accent: '#ffffff' 
    },
    LIQUID_CHROME: { 
        id: 'LIQUID_CHROME', 
        name: 'Liquid Chrome', 
        bgCss: 'linear-gradient(180deg, #101010 0%, #050505 50%, #000000 100%)', 
        accent: '#c0c0c0' 
    },
    NEON_DOJO: { 
        id: 'NEON_DOJO', 
        name: 'Neon Dojo', 
        bgCss: 'linear-gradient(to right, #1a0005 0%, #000000 50%, #1a0005 100%)', 
        accent: '#dc143c' 
    },
};

interface WorldStore {
    activeWorld: string;
    isGenerating: boolean;
    setActiveWorld: (id: string) => void;
    setIsGenerating: (status: boolean) => void;
}

export const useWorldStore = create<WorldStore>()(
    persist(
        (set) => ({
            activeWorld: 'CYBERDECK_PRIME',
            isGenerating: false,
            setActiveWorld: (id) => set({ activeWorld: id }),
            setIsGenerating: (status) => set({ isGenerating: status })
        }),
        { name: 'spacejamz-world-engine' }
    )
);
