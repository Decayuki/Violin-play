import React from 'react';
import { Play, Pause, Maximize2, Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface MiniPlayerProps {
    title: string;
    composer: string;
    coverUrl: string | null;
    isPlaying: boolean;
    onPlayPause: () => void;
    onExpand: () => void;
    className?: string;
    // Tuner Props
    isTunerActive?: boolean;
    tunerNote?: string;
    tunerCents?: number;
    onToggleTuner?: () => void;
}

export default function MiniPlayer({
    title,
    composer,
    coverUrl,
    isPlaying,
    onPlayPause,
    onExpand,
    className,
    isTunerActive = false,
    tunerNote = "-",
    tunerCents = 0,
    onToggleTuner
}: MiniPlayerProps) {
    const displayCover = coverUrl || '/default-cover.png';

    return (
        <div className={cn(
            "fixed bottom-0 left-0 right-0 bg-bg-secondary/95 backdrop-blur-md border-t border-white/10 p-3 flex items-center justify-between z-50 shadow-2xl transition-transform duration-300",
            className
        )}>
            {/* Left: Song Info & Cover */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-zinc-800 shrink-0 relative animate-[spin_10s_linear_infinite]" style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}>
                    <img
                        src={displayCover}
                        alt={title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/default-cover.png";
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
                </div>
                <div className="flex flex-col min-w-0 hidden sm:flex">
                    <h4 className="text-sm font-bold text-white truncate">{title}</h4>
                    <p className="text-xs text-text-secondary truncate">{composer}</p>
                </div>
            </div>

            {/* Center: Tuner (if active) or Spacer */}
            <div className="flex-[2] flex justify-center px-4">
                {isTunerActive ? (
                    <div className="flex items-center gap-4 w-full max-w-md bg-black/20 rounded-full px-4 py-1 border border-white/5">
                        <div className={cn(
                            "text-xl font-bold font-mono w-8 text-center",
                            Math.abs(tunerCents) < 5 && tunerNote !== "-" ? "text-green-400" : "text-white"
                        )}>
                            {tunerNote}
                        </div>

                        <div className="flex-1 h-1.5 bg-white/10 rounded-full relative overflow-hidden">
                            <div className="absolute top-0 bottom-0 w-0.5 bg-white/30 left-1/2" />
                            <div
                                className={cn(
                                    "absolute top-0 bottom-0 w-1.5 rounded-full transition-all duration-100",
                                    Math.abs(tunerCents) < 5 ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" : "bg-red-500"
                                )}
                                style={{ left: `${Math.max(0, Math.min(100, 50 + tunerCents))}%` }}
                            />
                        </div>

                        <div className={cn(
                            "text-xs font-mono w-8 text-right",
                            Math.abs(tunerCents) < 5 ? "text-green-400" : "text-red-400"
                        )}>
                            {tunerCents > 0 ? '+' : ''}{tunerCents}
                        </div>
                    </div>
                ) : (
                    <div className="hidden sm:block text-xs text-text-muted font-mono tracking-widest opacity-30">
                        FOCUS MODE
                    </div>
                )}
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-3 flex-1 justify-end">
                {/* Tuner Toggle */}
                {onToggleTuner && (
                    <button
                        onClick={onToggleTuner}
                        className={cn(
                            "p-2 rounded-full transition-colors",
                            isTunerActive ? "bg-gold-primary/20 text-gold-primary" : "text-text-muted hover:text-white"
                        )}
                        title="Toggle Tuner"
                    >
                        {isTunerActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </button>
                )}

                <button
                    onClick={onPlayPause}
                    className="w-10 h-10 rounded-full bg-gold-primary text-bg-primary flex items-center justify-center hover:bg-gold-light transition-colors shadow-lg"
                >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                </button>

                <div className="w-px h-6 bg-white/10 mx-1" />

                <button
                    onClick={onExpand}
                    className="p-2 text-text-muted hover:text-white transition-colors"
                    title="Expand Player"
                >
                    <Maximize2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
