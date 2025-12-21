import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface TunerWidgetProps {
    isActive: boolean;
    note: string;
    cents: number;
    frequency: number;
    hasSignal?: boolean;
    onToggle: () => void;
}

export default function TunerWidget({ isActive, note, cents, frequency, hasSignal = false, onToggle }: TunerWidgetProps) {
    return (
        <div className={cn(
            "w-full p-4 flex flex-col gap-4 relative overflow-hidden transition-all duration-500",
            isActive ? "bg-black/40 border border-gold-primary/20 rounded-2xl shadow-lg" : "bg-transparent border-b border-border-subtle"
        )}>
            {/* Background Glow */}
            {isActive && hasSignal && (
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className={cn(
                        "absolute inset-0 transition-colors duration-500 blur-3xl",
                        Math.abs(cents) < 5 ? "bg-green-500/30" : "bg-red-500/30"
                    )} />
                </div>
            )}

            <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onToggle}
                        className={cn(
                            "p-2.5 rounded-full transition-all duration-300 flex items-center gap-2",
                            isActive
                                ? "bg-gold-primary text-bg-primary shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:bg-gold-light"
                                : "bg-bg-tertiary text-text-muted hover:text-white hover:bg-bg-secondary"
                        )}
                    >
                        {isActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                        <span className="text-xs font-bold tracking-wider">{isActive ? "ON" : "TUNER"}</span>
                    </button>
                    {isActive && !hasSignal && (
                        <span className="text-xs text-text-muted animate-pulse">Listening...</span>
                    )}
                </div>

                {isActive && hasSignal && (
                    <div className="flex items-center gap-4 font-mono">
                        <div className="text-xs text-text-muted">{frequency} Hz</div>
                        <div className={cn(
                            "text-xs font-bold px-2 py-0.5 rounded-full bg-black/40",
                            Math.abs(cents) < 5 ? "text-green-400" : "text-red-400"
                        )}>
                            {cents > 0 ? '+' : ''}{cents}
                        </div>
                    </div>
                )}
            </div>

            {isActive && (
                <div className={cn("flex items-center gap-6 z-10 pt-2 transition-opacity duration-300", hasSignal ? "opacity-100" : "opacity-30")}>
                    {/* Note Display */}
                    <div className={cn(
                        "text-5xl font-bold font-mono w-20 text-center transition-colors duration-200 drop-shadow-md",
                        Math.abs(cents) < 5 && note !== "-" ? "text-green-400" : "text-white"
                    )}>
                        {note}
                    </div>

                    {/* Horizontal Bar Visualizer (Polished) */}
                    <div className="flex-1 h-3 bg-black/40 rounded-full relative overflow-hidden border border-white/5 shadow-inner">
                        {/* Center Marker */}
                        <div className="absolute top-0 bottom-0 w-0.5 bg-white/50 left-1/2 z-20" />

                        {/* Range Markers */}
                        <div className="absolute top-0 bottom-0 w-px bg-white/10 left-[25%]" />
                        <div className="absolute top-0 bottom-0 w-px bg-white/10 left-[75%]" />

                        {/* Moving Indicator (Smooth Pill) */}
                        <div
                            className={cn(
                                "absolute top-0 bottom-0 w-2 rounded-full transition-all duration-150 ease-out shadow-[0_0_10px_currentColor]",
                                Math.abs(cents) < 5 ? "bg-green-500 text-green-500" : "bg-red-500 text-red-500"
                            )}
                            style={{
                                left: `${Math.max(2, Math.min(98, 50 + cents))}%`,
                                transform: 'translateX(-50%)'
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
