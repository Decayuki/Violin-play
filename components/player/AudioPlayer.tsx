'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Settings2, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface AudioPlayerProps {
    url: string | null;
    isPlaying?: boolean;
    onPlayStateChange?: (isPlaying: boolean) => void;
    playbackRate?: number;
    onPlaybackRateChange?: (rate: number) => void;
}

export default function AudioPlayer({
    url,
    isPlaying: externalIsPlaying,
    onPlayStateChange,
    playbackRate = 1,
    onPlaybackRateChange
}: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [internalIsPlaying, setInternalIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isLooping, setIsLooping] = useState(false);

    // Use external state if provided, otherwise internal
    const isPlaying = externalIsPlaying !== undefined ? externalIsPlaying : internalIsPlaying;

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Playback failed:", e));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, url]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackRate;
        }
    }, [playbackRate]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    const togglePlay = () => {
        const newState = !isPlaying;
        setInternalIsPlaying(newState);
        onPlayStateChange?.(newState);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const vol = parseFloat(e.target.value);
        setVolume(vol);
        if (vol > 0 && isMuted) setIsMuted(false);
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const speeds = [0.5, 0.75, 1, 1.25, 1.5];

    if (!url) {
        return (
            <div className="w-full bg-bg-secondary/50 backdrop-blur-md rounded-xl border border-white/10 p-6 flex items-center justify-center min-h-[200px]">
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center mx-auto mb-3">
                        <VolumeX className="w-6 h-6 text-text-muted" />
                    </div>
                    <p className="text-text-primary font-medium">Audio not available</p>
                    <p className="text-xs text-text-muted">No recording found for this track</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-bg-secondary/50 backdrop-blur-md rounded-xl border border-white/10 p-6 flex flex-col gap-4">
            <audio
                ref={audioRef}
                src={url}
                loop={isLooping}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => {
                    setInternalIsPlaying(false);
                    onPlayStateChange?.(false);
                }}
            />

            {/* Progress Bar */}
            <div className="flex flex-col gap-2">
                <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-gold-primary hover:accent-gold-light transition-all"
                />
                <div className="flex justify-between text-xs text-text-muted font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">

                {/* Volume */}
                <div className="flex items-center gap-2 group relative w-24">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-text-secondary hover:text-text-primary transition-colors"
                    >
                        {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-16 h-1 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-text-secondary hover:accent-text-primary"
                    />
                </div>

                {/* Main Controls */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setIsLooping(!isLooping)}
                        className={cn(
                            "transition-colors",
                            isLooping ? "text-gold-primary" : "text-text-muted hover:text-text-primary"
                        )}
                        title="Loop"
                    >
                        <Repeat className="w-5 h-5" />
                    </button>

                    <button
                        onClick={togglePlay}
                        className="w-14 h-14 rounded-full bg-gold-primary text-bg-primary flex items-center justify-center hover:bg-gold-light hover:scale-105 transition-all shadow-lg shadow-gold-primary/20"
                    >
                        {isPlaying ? (
                            <Pause className="w-6 h-6 fill-current" />
                        ) : (
                            <Play className="w-6 h-6 fill-current ml-1" />
                        )}
                    </button>

                    {/* Speed Control */}
                    <div className="relative group">
                        <button
                            className="text-text-muted hover:text-text-primary transition-colors flex items-center gap-1 font-mono text-xs"
                            onClick={() => {
                                const currentIndex = speeds.indexOf(playbackRate);
                                const nextIndex = (currentIndex + 1) % speeds.length;
                                onPlaybackRateChange?.(speeds[nextIndex]);
                            }}
                        >
                            <Settings2 className="w-4 h-4" />
                            <span>{playbackRate}x</span>
                        </button>
                    </div>
                </div>

                {/* Spacer to balance layout */}
                <div className="w-24 flex justify-end">
                    {/* Could add more controls here later */}
                </div>
            </div>
        </div>
    );
}
