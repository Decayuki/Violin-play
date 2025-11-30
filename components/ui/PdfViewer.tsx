"use client";

import { useEffect } from 'react';
import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface PdfViewerProps {
    url: string;
    isPlaying?: boolean;
    isAutoScrollEnabled?: boolean;
    scrollSpeed?: number; // pixels per tick (approx 16ms)
}

export default function PdfViewer({
    url,
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

    return (
        <div className="h-full w-full bg-bg-secondary overflow-hidden">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <div className="h-full w-full pdf-dark-theme">
                    <Viewer
                        fileUrl={url}
                        plugins={[defaultLayoutPluginInstance]}
                        theme="dark"
                        defaultScale={SpecialZoomLevel.PageFit}
                    />
                </div>
            </Worker>
        </div>
    );
}
