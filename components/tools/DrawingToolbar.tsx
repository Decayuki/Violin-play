"use client";

import { useAnnotationStore } from '@/lib/store/useAnnotationStore';
import { Button } from '@/components/ui/Button';
import { Pen, Eraser, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function DrawingToolbar() {
    const {
        isDrawingMode,
        setDrawingMode,
        currentTool,
        setTool,
        currentColor,
        setColor
    } = useAnnotationStore();

    if (!isDrawingMode) {
        return (
            <Button
                variant="secondary"
                // size="icon" removed, using custom class
                className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg w-12 h-12 p-0"
                onClick={() => setDrawingMode(true)}
            >
                <Pen className="w-6 h-6" />
            </Button>
        );
    }

    const colors = ['#ef4444', '#3b82f6', '#000000', '#22c55e'];

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 items-end">
            <div className="bg-bg-elevated border border-border-default rounded-lg shadow-xl p-2 flex flex-col gap-2 animate-in slide-in-from-bottom-5">
                <div className="flex gap-2">
                    <Button
                        variant={currentTool === 'pen' ? 'primary' : 'ghost'}
                        size="sm"
                        className="px-2"
                        onClick={() => setTool('pen')}
                    >
                        <Pen className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={currentTool === 'eraser' ? 'primary' : 'ghost'}
                        size="sm"
                        className="px-2"
                        onClick={() => setTool('eraser')}
                    >
                        <Eraser className="w-4 h-4" />
                    </Button>
                </div>

                {currentTool === 'pen' && (
                    <div className="flex gap-2 p-1 bg-bg-secondary rounded-md">
                        {colors.map(color => (
                            <button
                                key={color}
                                className={cn(
                                    "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                                    currentColor === color ? "border-white scale-110" : "border-transparent"
                                )}
                                style={{ backgroundColor: color }}
                                onClick={() => setColor(color)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Button
                variant="danger"
                // size="icon" removed
                className="rounded-full shadow-lg w-12 h-12 p-0"
                onClick={() => setDrawingMode(false)}
            >
                <X className="w-6 h-6" />
            </Button>
        </div>
    );
}
