'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Settings2, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface AudioPlayerProps {
    url: string | null;
    coverUrl?: string | null;
    isPlaying?: boolean;
    onPlayStateChange?: (isPlaying: boolean) => void;
    playbackRate?: number;
    onPlaybackRateChange?: (rate: number) => void;
}

export default function AudioPlayer({
    url,
    coverUrl,
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
    const displayCover = coverUrl || '/default-cover.png';

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
        <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto">
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

            {/* Turntable Visual */}
            <div className="relative w-72 h-72 bg-[#1a1a1a] rounded-3xl shadow-2xl border border-white/5 flex items-center justify-center overflow-hidden group">
                {/* Wood/Metal Texture Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                {/* Vinyl Record */}
                <div
                    className={cn(
                        "relative w-[90%] h-[90%] rounded-full bg-black shadow-xl border-[6px] border-[#111] flex items-center justify-center transition-transform",
                        isPlaying ? "animate-[spin_4s_linear_infinite]" : ""
                    )}
                    style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
                >
                    {/* Vinyl Grooves (CSS Gradients) */}
                    <div className="absolute inset-0 rounded-full bg-[repeating-radial-gradient(#111_0,#111_2px,#222_3px,#111_4px)] opacity-80" />

                    {/* Reflections */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none" />

                    {/* Center Label / Cover */}
                    <div className="w-[35%] h-[35%] rounded-full overflow-hidden relative z-10 border-4 border-[#111] shadow-inner bg-zinc-900 flex items-center justify-center">
                        <img
                            src={displayCover}
                            alt="Cover"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/default-cover.png";
                            }}
                            className="w-full h-full object-cover"
                        />
                        {/* Shine effect on label */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                    </div>
                </div>

                {/* Tonearm */}
                <div className={cn(
                    "absolute top-5 right-5 w-1.5 h-32 bg-gradient-to-b from-zinc-800 to-zinc-900 origin-top transition-transform duration-700 shadow-xl z-20 rounded-full border border-white/10",
                    isPlaying ? "rotate-[25deg]" : "rotate-0"
                )}>
                    {/* Pivot Base */}
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full shadow-lg border border-gold-primary/30 bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center">
                        <div className="w-3 h-3 bg-gold-primary rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                    </div>

                    {/* Arm Detail (Gold Accent) */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-white/5" />

                    {/* Head/Needle */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-6 bg-zinc-900 rounded-sm shadow-md border border-gold-primary/20 flex flex-col items-center justify-end pb-1">
                        <div className="w-0.5 h-1.5 bg-gold-primary" />
                    </div>
                </div>
            </div>

            {/* Controls Container */}
            <div className="w-full bg-bg-secondary/50 backdrop-blur-md rounded-xl border border-white/10 p-6 flex flex-col gap-4">

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

                {/* Main Controls */}
                <div className="flex items-center justify-between">

                    {/* Volume */}
                    <div className="flex items-center gap-2 group relative w-16 sm:w-24">
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
                            className="w-8 sm:w-16 h-1 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-text-secondary hover:accent-text-primary"
                        />
                    </div>

                    {/* Playback Controls */}
                    <div className="flex items-center gap-3 sm:gap-6">
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

                    {/* Spacer */}
                    <div className="w-24 flex justify-end" />
                </div>
            </div>
        </div>
    );
}
