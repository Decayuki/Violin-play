import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface LevelSelectorProps {
    selectedLevel: number | null;
    onSelect: (level: number | null) => void;
    songCounts?: Record<number, number>;
}

export const LevelSelector = ({ selectedLevel, onSelect, songCounts }: LevelSelectorProps) => {
    const levels = [1, 2, 3, 4];

    return (
        <div className="flex gap-8 justify-center py-8">
            {levels.map((level) => {
                const isSelected = selectedLevel === level;

                return (
                    <button
                        key={level}
                        onClick={() => onSelect(isSelected ? null : level)}
                        className="group flex flex-col items-center gap-3"
                    >
                        {/* Circular Control Dial */}
                        <div className={cn(
                            "relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
                            "border border-border-subtle bg-bg-secondary",
                            isSelected ? "border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]" : "group-hover:border-text-secondary"
                        )}>
                            {/* Technical Ring Marks */}
                            <div className="absolute inset-0 rounded-full border border-dashed border-border-subtle opacity-50" />

                            {/* Active Indicator Dot */}
                            {isSelected && (
                                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-warning rounded-full shadow-[0_0_5px_rgba(245,158,11,0.8)]" />
                            )}

                            <span className={cn(
                                "font-mono text-xl tracking-tighter transition-colors",
                                isSelected ? "text-white font-bold" : "text-text-muted group-hover:text-text-primary"
                            )}>
                                0{level}
                            </span>
                        </div>

                        {/* Label */}
                        <div className="flex flex-col items-center gap-1">
                            <span className={cn(
                                "text-[10px] font-mono uppercase tracking-widest",
                                isSelected ? "text-white" : "text-text-muted"
                            )}>
                                LEVEL
                            </span>
                            {songCounts && songCounts[level] > 0 && (
                                <span className="text-[9px] font-mono text-text-muted opacity-60">
                                    [{songCounts[level]}]
                                </span>
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );
};
