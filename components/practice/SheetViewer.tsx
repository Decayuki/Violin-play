import { useState } from 'react';
import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { Button } from '@/components/ui/Button';
import { ZoomIn, ZoomOut, Maximize, Minimize } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import AnnotationLayer from '@/components/tools/AnnotationLayer';
import DrawingToolbar from '@/components/tools/DrawingToolbar';

interface SheetViewerProps {
    pdfUrl: string;
    songId: string;
    userId?: string;
    onFullscreenChange?: (isFullscreen: boolean) => void;
}

export const SheetViewer = ({ pdfUrl, songId, userId, onFullscreenChange }: SheetViewerProps) => {
    const [zoom, setZoom] = useState(1.0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    // PDF.js worker source
    const workerUrl = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3.0));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));

    const toggleFullscreen = () => {
        const newState = !isFullscreen;
        setIsFullscreen(newState);
        onFullscreenChange?.(newState);
    };

    return (
        <div className={cn("flex flex-col h-full bg-bg-secondary rounded-lg border border-border-default overflow-hidden relative", isFullscreen && "fixed inset-0 z-50 rounded-none border-none")}>
            <div className="flex items-center justify-between p-2 border-b border-border-subtle bg-bg-elevated z-20 relative">
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
                            renderPage={(props) => (
                                <>
                                    {props.canvasLayer.children}
                                    {props.textLayer.children}
                                    {props.annotationLayer.children}
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        zIndex: 50,
                                        pointerEvents: 'none'
                                    }}>
                                        <AnnotationLayer
                                            pageNumber={props.pageIndex}
                                            songId={songId}
                                            userId={userId}
                                            scale={props.scale}
                                        />
                                    </div>
                                </>
                            )}
                        />
                    </div>
                </Worker>
            </div>
            <DrawingToolbar />
        </div>
    );
};
