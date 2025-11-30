import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
    // Session selections
    selectedCatalogueId: string | null;
    selectedLevel: number | null;
    selectedSongId: string | null;
    accompanimentMode: 'backtrack' | 'cover' | null;

    // Viewer state
    sheetZoom: number;
    sheetFitMode: 'width' | 'height' | 'none';
    isSheetFullscreen: boolean;

    // Audio
    audioVolume: number;
    audioPlaybackRate: number;

    // User difficulties (local cache)
    userDifficulties: Record<string, number>;

    // Actions
    setSelectedCatalogue: (id: string | null) => void;
    setSelectedLevel: (level: number | null) => void;
    setSelectedSong: (id: string | null) => void;
    setAccompanimentMode: (mode: 'backtrack' | 'cover' | null) => void;
    setSheetZoom: (zoom: number) => void;
    setSheetFitMode: (mode: 'width' | 'height' | 'none') => void;
    setSheetFullscreen: (fullscreen: boolean) => void;
    setAudioVolume: (volume: number) => void;
    setAudioPlaybackRate: (rate: number) => void;
    setUserDifficulty: (songId: string, difficulty: number | null) => void;
    resetSession: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            // Initial state
            selectedCatalogueId: null,
            selectedLevel: null,
            selectedSongId: null,
            accompanimentMode: null,
            sheetZoom: 100,
            sheetFitMode: 'width',
            isSheetFullscreen: false,
            audioVolume: 0.8,
            audioPlaybackRate: 1.0,
            userDifficulties: {},

            // Actions
            setSelectedCatalogue: (id) => set({ selectedCatalogueId: id }),
            setSelectedLevel: (level) => set({ selectedLevel: level, selectedSongId: null }),
            setSelectedSong: (id) => set({ selectedSongId: id }),
            setAccompanimentMode: (mode) => set({ accompanimentMode: mode }),
            setSheetZoom: (zoom) => set({ sheetZoom: Math.max(50, Math.min(300, zoom)) }),
            setSheetFitMode: (mode) => set({ sheetFitMode: mode }),
            setSheetFullscreen: (fullscreen) => set({ isSheetFullscreen: fullscreen }),
            setAudioVolume: (volume) => set({ audioVolume: Math.max(0, Math.min(1, volume)) }),
            setAudioPlaybackRate: (rate) => set({ audioPlaybackRate: rate }),
            setUserDifficulty: (songId, difficulty) =>
                set((state) => ({
                    userDifficulties: {
                        ...state.userDifficulties,
                        [songId]: difficulty ?? state.userDifficulties[songId], // If null, maybe remove? But type says number | null. Logic might need adjustment if null means reset.
                    },
                })),
            resetSession: () => set({
                selectedLevel: null,
                selectedSongId: null,
                accompanimentMode: null,
            }),
        }),
        {
            name: 'violin-app-storage',
            partialize: (state) => ({
                audioVolume: state.audioVolume,
                audioPlaybackRate: state.audioPlaybackRate,
                sheetZoom: state.sheetZoom,
                sheetFitMode: state.sheetFitMode,
                // We might want to persist userDifficulties too if we want offline support, 
                // but usually this comes from DB. Keeping it for now.
            }),
        }
    )
);
