"use client";

import { useEffect } from 'react';
import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import AnnotationLayer from '@/components/tools/AnnotationLayer';
import DrawingToolbar from '@/components/tools/DrawingToolbar';

interface PdfViewerProps {
    url: string;
    songId: string;
    userId?: string;
    isPlaying?: boolean;
    isAutoScrollEnabled?: boolean;
    scrollSpeed?: number; // pixels per tick (approx 16ms)
}

export default function PdfViewer({
    url,
    songId,
    userId,
    isPlaying = false,
    isAutoScrollEnabled = true,
    scrollSpeed = 0.5
}: PdfViewerProps) {
    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        sidebarTabs: (defaultTabs) => [], // Hide sidebar
    });

    // Auto-scroll Logic
    useEffect(() => {
        let animationFrameId: number;
        let scrollAccumulator = 0; // To handle sub-pixel scrolling

        const scroll = () => {
            if (!isPlaying || !isAutoScrollEnabled) return;

            // Target the specific scrollable container from react-pdf-viewer
            const scrollContainer = document.querySelector('.rpv-core__inner-pages');

            if (scrollContainer) {
                scrollAccumulator += scrollSpeed;

                if (scrollAccumulator >= 1) {
                    const pixelsToScroll = Math.floor(scrollAccumulator);
                    scrollContainer.scrollTop += pixelsToScroll;
                    scrollAccumulator -= pixelsToScroll;
                }

                animationFrameId = requestAnimationFrame(scroll);
            }
        };

        if (isPlaying && isAutoScrollEnabled) {
            animationFrameId = requestAnimationFrame(scroll);
        }

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [isPlaying, isAutoScrollEnabled, scrollSpeed]);

    // ... existing code ...
    // We need to handle page rendering to inject the AnnotationLayer
    // react-pdf-viewer provides a 'renderPage' prop or we can use a plugin.
    // However, the simplest way to overlay on *every* page is to use the 'renderPage' prop of the Viewer.

    const renderPage = (props: any) => {
        return (
            <>
                {props.canvasLayer.children}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }}>
                    {/* We need to pass the page index and dimensions to the annotation layer */}
                    {/* Note: props.pageIndex is 0-indexed */}
                    <AnnotationLayer
                        pageNumber={props.pageIndex}
                        songId={songId}
                        userId={userId}
                        scale={props.scale}
                    />
                </div>
                {props.textLayer.children}
                {props.annotationLayer.children}
            </>
        );
    };

    // Wait, renderPage replaces the *entire* page content rendering.
    // A better approach might be to just wrap the Viewer or use a custom plugin.
    // But let's try to stick to the plan.
    // Actually, 'renderPage' is powerful.

    // Let's modify the PdfViewer to accept songId first.

    return (
        <div className="h-full w-full bg-bg-secondary overflow-hidden relative">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <div className="h-full w-full pdf-dark-theme">
                    <Viewer
                        fileUrl={url}
                        plugins={[defaultLayoutPluginInstance]}
                        theme="dark"
                        defaultScale={SpecialZoomLevel.PageFit}
                        renderPage={(props) => (
                            <>
                                {props.canvasLayer.children}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    zIndex: 5,
                                    pointerEvents: 'none' // Let clicks pass through unless drawing?
                                }}>
                                    <AnnotationLayer
                                        pageNumber={props.pageIndex}
                                        songId={songId}
                                        userId={userId}
                                        scale={props.scale}
                                    />
                                </div>
                                {props.textLayer.children}
                                {props.annotationLayer.children}
                            </>
                        )}
                    />
                </div>
            </Worker>
            <DrawingToolbar />
        </div>
    );
}
