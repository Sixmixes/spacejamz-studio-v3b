import { create } from 'zustand';

interface NeuralStore {
    // FlixSynth State
    generatePrompt: string;
    aspectRatio: string;
    imageCount: string;
    
    // Generative Workflow State
    currentBatchIndex: number;
    batchUrls: string[];
    isBatchMode: boolean;
    batchLogs: any[];

    // Setters
    setGeneratePrompt: (prompt: string) => void;
    setAspectRatio: (ratio: string) => void;
    setImageCount: (count: string) => void;
    
    setCurrentBatchIndex: (index: number) => void;
    setBatchUrls: (urls: string[]) => void;
    setIsBatchMode: (isBatchMode: boolean) => void;
    addBatchLog: (log: any) => void;
    clearBatchLogs: () => void;
}

export const useNeuralStore = create<NeuralStore>((set) => ({
    generatePrompt: '',
    aspectRatio: '1:1',
    imageCount: '1',

    currentBatchIndex: 0,
    batchUrls: [],
    isBatchMode: false,
    batchLogs: [],

    setGeneratePrompt: (prompt) => set({ generatePrompt: prompt }),
    setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
    setImageCount: (count) => set({ imageCount: count }),
    
    setCurrentBatchIndex: (index) => set({ currentBatchIndex: index }),
    setBatchUrls: (urls) => set({ batchUrls: urls }),
    setIsBatchMode: (mode) => set({ isBatchMode: mode }),
    addBatchLog: (log) => set((state) => ({ batchLogs: [...state.batchLogs, log] })),
    clearBatchLogs: () => set({ batchLogs: [] }),
}));
