"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import { useAnnotationStore } from '@/lib/store/useAnnotationStore';
import { createClient } from '@/lib/supabase/client';

interface AnnotationLayerProps {
    pageNumber: number;
    songId: string;
    userId?: string;
    scale: number;
}

// Debounce helper
function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

export default function AnnotationLayer({
    pageNumber,
    songId,
    userId,
    scale
}: AnnotationLayerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const { isDrawingMode, currentTool, currentColor, strokeWidth } = useAnnotationStore();
    const isLoadedRef = useRef(false);
    const [isLoading, setIsLoading] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const supabase = createClient();

    // Initialize Canvas
    useEffect(() => {
        if (!canvasRef.current || fabricCanvasRef.current) return;

        // Reset loaded state for new canvas
        isLoadedRef.current = false;

        const parent = canvasRef.current.parentElement;
        if (!parent) return;

        const { width, height } = parent.getBoundingClientRect();

        const canvas = new fabric.Canvas(canvasRef.current, {
            isDrawingMode: isDrawingMode,
            width: width,
            height: height,
            selection: false, // Disable group selection
        });

        canvas.setZoom(scale);

        fabricCanvasRef.current = canvas;

        // Load existing annotations
        const loadAnnotations = async () => {
            try {
                if (!userId) {
                    console.warn('No user ID provided, skipping annotation load');
                    isLoadedRef.current = true;
                    setIsLoading(false);
                    return;
                }

                setIsLoading(true);
                console.log('Loading annotations for', { songId, pageNumber, userId });

                const { data, error } = await supabase
                    .from('annotations')
                    .select('data')
                    .eq('song_id', songId)
                    .eq('user_id', userId)
                    .eq('page_number', pageNumber)
                    .maybeSingle();

                if (error) {
                    console.error('Error loading annotations:', error);
                    isLoadedRef.current = true;
                    setIsLoading(false);
                    return;
                }

                if (data?.data && data.data.objects && data.data.objects.length > 0) {
                    console.log('Found annotations, loading...', data.data);
                    try {
                        // Load from JSON synchronously - Fabric.js v6 callback signature
                        canvas.loadFromJSON(data.data);
                        canvas.requestRenderAll();
                        console.log('Annotations loaded successfully');
                    } catch (loadError) {
                        console.error('Error in loadFromJSON:', loadError);
                        // Continue anyway - just log the error
                    }
                } else {
                    console.log('No existing annotations found for this page');
                }

                isLoadedRef.current = true;
                setIsLoading(false);
            } catch (err) {
                console.error('Failed to load annotations:', err);
                isLoadedRef.current = true;
                setIsLoading(false);
            }
        };

        loadAnnotations();

        // Auto-save on modification (with debouncing)
        const saveAnnotationsImmediate = async () => {
            if (!isLoadedRef.current) {
                console.log('Not loaded yet, skipping save');
                return;
            }

            if (!userId) {
                console.error('No user ID, cannot save annotations');
                setSaveError('User not authenticated');
                return;
            }

            const json = canvas.toJSON();
            console.log('Saving annotations...', { pageNumber, objectCount: canvas.getObjects().length });

            try {
                const { error } = await supabase
                    .from('annotations')
                    .upsert({
                        song_id: songId,
                        user_id: userId,
                        page_number: pageNumber,
                        data: json
                    }, {
                        onConflict: 'song_id,user_id,page_number'
                    });

                if (error) {
                    console.error('Error saving annotations:', error);
                    setSaveError(error.message);
                } else {
                    console.log('✓ Annotations saved successfully');
                    setSaveError(null);
                }
            } catch (err) {
                console.error('Failed to save annotations:', err);
                setSaveError('Failed to save annotations');
            }
        };

        // Debounced save (500ms delay)
        const saveAnnotations = debounce(saveAnnotationsImmediate, 500);

        canvas.on('path:created', saveAnnotations);
        canvas.on('object:modified', saveAnnotations);
        canvas.on('object:removed', saveAnnotations);

        return () => {
            canvas.dispose();
            fabricCanvasRef.current = null;
        };
    }, [pageNumber, songId, userId]); // Removed scale from dependencies

    // Update scale without disposing canvas
    useEffect(() => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        canvas.setZoom(scale);
        canvas.requestRenderAll();
    }, [scale]);

    // Update Drawing Mode & Brush
    useEffect(() => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        if (currentTool === 'pen') {
            canvas.isDrawingMode = isDrawingMode;
            canvas.selection = false;

            if (isDrawingMode) {
                canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
                canvas.freeDrawingBrush.color = currentColor;
                canvas.freeDrawingBrush.width = strokeWidth;
            }

            // Make objects non-selectable in pen mode
            canvas.forEachObject((obj: any) => {
                obj.selectable = false;
                obj.evented = false;
            });
        } else if (currentTool === 'eraser') {
            // In eraser mode, disable drawing and enable selection
            canvas.isDrawingMode = false;
            canvas.selection = false; // Disable group selection

            // Make all objects selectable and hoverable
            canvas.forEachObject((obj: any) => {
                obj.selectable = true;
                obj.evented = true;
                obj.hoverCursor = 'pointer';
            });

            // Remove object on click
            const handleObjectClick = (e: any) => {
                if (e.target) {
                    canvas.remove(e.target);
                    canvas.requestRenderAll();
                }
            };

            // Remove previous listeners to avoid duplicates
            canvas.off('mouse:down', handleObjectClick);

            // Add the click handler
            canvas.on('mouse:down', handleObjectClick);
        }
    }, [isDrawingMode, currentTool, currentColor, strokeWidth]);

    return (
        <>
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 z-10 pointer-events-auto"
            />

            {/* Loading indicator */}
            {isLoading && (
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    Loading annotations...
                </div>
            )}

            {/* Error indicator */}
            {saveError && (
                <div className="absolute top-2 right-2 bg-red-500/90 text-white text-xs px-2 py-1 rounded">
                    {saveError}
                </div>
            )}
        </>
    );
}
