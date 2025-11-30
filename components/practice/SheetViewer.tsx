import { useState } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { Button } from '@/components/ui/Button';
import { ZoomIn, ZoomOut, Maximize, Minimize } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SheetViewerProps {
    pdfUrl: string;
    onFullscreenChange?: (isFullscreen: boolean) => void;
}

export const SheetViewer = ({ pdfUrl, onFullscreenChange }: SheetViewerProps) => {
    const [zoom, setZoom] = useState(1.0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    // PDF.js worker source
    // We need to ensure the worker is available. Usually copied to public or CDN.
    // For now using unpkg CDN for simplicity in setup, but production should use local file.
    const workerUrl = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3.0));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));

    const toggleFullscreen = () => {
        const newState = !isFullscreen;
        setIsFullscreen(newState);
        onFullscreenChange?.(newState);
    };

    return (
        <div className={cn("flex flex-col h-full bg-bg-secondary rounded-lg border border-border-default overflow-hidden", isFullscreen && "fixed inset-0 z-50 rounded-none border-none")}>
            <div className="flex items-center justify-between p-2 border-b border-border-subtle bg-bg-elevated">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                        <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-xs font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
                    <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                        <ZoomIn className="w-4 h-4" />
                    </Button>
                </div>

                <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </Button>
            </div>

            <div className="flex-1 overflow-auto relative bg-gray-900">
                <Worker workerUrl={workerUrl}>
                    <div style={{ height: '100%', width: '100%' }}>
                        <Viewer
                            fileUrl={pdfUrl}
                            plugins={[defaultLayoutPluginInstance]}
                            defaultScale={zoom}
                            theme="dark"
                        />
                    </div>
                </Worker>
            </div>
        </div>
    );
};
