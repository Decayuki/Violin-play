import { create } from 'zustand';

interface AnnotationState {
    isDrawingMode: boolean;
    currentTool: 'pen' | 'eraser';
    currentColor: string;
    strokeWidth: number;

    // Actions
    setDrawingMode: (isDrawing: boolean) => void;
    setTool: (tool: 'pen' | 'eraser') => void;
    setColor: (color: string) => void;
    setStrokeWidth: (width: number) => void;
}

export const useAnnotationStore = create<AnnotationState>((set) => ({
    isDrawingMode: false,
    currentTool: 'pen',
    currentColor: '#ef4444', // Default red
    strokeWidth: 2,

    setDrawingMode: (isDrawing) => set({ isDrawingMode: isDrawing }),
    setTool: (tool) => set({ currentTool: tool }),
    setColor: (color) => set({ currentColor: color }),
    setStrokeWidth: (width) => set({ strokeWidth: width }),
}));
