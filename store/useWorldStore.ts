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
        bgCss: 'radial-gradient(ellipse at center, #001a1a 0%, #000000 100%)', 
        accent: '#00ffff'  // Legacy Neon Cyan
    },
    ABYSSAL_SINGULARITY: { 
        id: 'ABYSSAL_SINGULARITY', 
        name: 'Abyssal Singularity', 
        bgCss: 'radial-gradient(circle at 50% 50%, #15002b 0%, #06000d 50%, #000000 100%)', 
        accent: '#bf00ff'  // Legacy Deep Neon Purple
    },
    SOLAR_SUPERNOVA: { 
        id: 'SOLAR_SUPERNOVA', 
        name: 'Solar Supernova', 
        bgCss: 'radial-gradient(circle at top, #2a0800 0%, #1a0200 60%, #000000 100%)', 
        accent: '#ff3300'  // Legacy Neon Orange
    },
    SILICON_GRAVE: { 
        id: 'SILICON_GRAVE', 
        name: 'Silicon Grave', 
        bgCss: 'linear-gradient(to bottom, #0a1c00 0%, #000500 100%)', 
        accent: '#39ff14'  // Legacy Matrix Green
    },
    SECTOR_7_SYNDICATE: { 
        id: 'SECTOR_7_SYNDICATE', 
        name: 'Sector 7 Syndicate', 
        bgCss: 'linear-gradient(135deg, #1f0003 0%, #0a0001 100%)', 
        accent: '#ff003c'  // Legacy Cyberpunk Red
    },
    QUANTUM_MATRIX: { 
        id: 'QUANTUM_MATRIX', 
        name: 'Quantum Matrix', 
        bgCss: 'radial-gradient(ellipse at bottom, #001a1a 0%, #000505 100%)', 
        accent: '#00fa9a'  // Medium Spring Green / Mint
    },
    ZERO_G_ANOMALY: { 
        id: 'ZERO_G_ANOMALY', 
        name: 'Zero-G Anomaly', 
        bgCss: 'radial-gradient(circle at center, #0f1520 0%, #050a0f 100%)', 
        accent: '#00bfff'  // Deep Sky Blue
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
        bgCss: 'linear-gradient(to right, #1a000f 0%, #000000 50%, #1a000f 100%)', 
        accent: '#ff0055'  // Synthwave Hot Pink
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
