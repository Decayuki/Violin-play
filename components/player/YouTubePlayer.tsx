"use client";

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';

interface YouTubePlayerProps {
    videoId: string;
    onReady?: () => void;
    onStateChange?: (state: number) => void;
    className?: string;
}

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

export default function YouTubePlayer({
    videoId,
    onReady,
    onStateChange,
    className = ''
}: YouTubePlayerProps) {
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Load YouTube IFrame API
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = () => {
                initPlayer();
            };
        } else {
            initPlayer();
        }

        function initPlayer() {
            if (!containerRef.current || playerRef.current) return;

            playerRef.current = new window.YT.Player(containerRef.current, {
                videoId,
                playerVars: {
                    autoplay: 0,
                    controls: 1,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    origin: window.location.origin,
                },
                events: {
                    onReady: (event: any) => {
                        setIsReady(true);
                        onReady?.();
                    },
                    onStateChange: (event: any) => {
                        setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
                        onStateChange?.(event.data);
                    },
                },
            });
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, [videoId, onReady, onStateChange]);

    const togglePlay = () => {
        if (!playerRef.current) return;

        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
    };

    const toggleMute = () => {
        if (!playerRef.current) return;

        if (isMuted) {
            playerRef.current.unMute();
        } else {
            playerRef.current.mute();
        }
        setIsMuted(!isMuted);
    };

    const toggleFullscreen = () => {
        const iframe = containerRef.current?.querySelector('iframe');
        if (!iframe) return;

        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            iframe.requestFullscreen();
        }
    };

    return (
        <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
            <div ref={containerRef} className="w-full aspect-video" />

            {isReady && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={togglePlay}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? (
                                <Pause className="w-5 h-5 text-white" />
                            ) : (
                                <Play className="w-5 h-5 text-white" />
                            )}
                        </button>

                        <button
                            onClick={toggleMute}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            aria-label={isMuted ? 'Unmute' : 'Mute'}
                        >
                            {isMuted ? (
                                <VolumeX className="w-5 h-5 text-white" />
                            ) : (
                                <Volume2 className="w-5 h-5 text-white" />
                            )}
                        </button>

                        <div className="flex-1" />

                        <button
                            onClick={toggleFullscreen}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            aria-label="Fullscreen"
                        >
                            <Maximize2 className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
