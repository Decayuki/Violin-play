import Link from "next/link";
import { Play, Music2, Heart, FileText } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Song {
    id: string;
    title: string;
    composer: string | null;
    base_difficulty: number;
    tags: string[] | null;
    cover_url: string | null;
}

interface SongCardProps {
    song: Song;
    onClick: () => void;
    isActive?: boolean;
    isFavorite?: boolean;
    onToggleFavorite?: (e: React.MouseEvent) => void;
}

export default function SongCard({
    song,
    onClick,
    isActive = false,
    isFavorite = false,
    onToggleFavorite
}: SongCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative flex flex-col overflow-hidden cursor-pointer rounded-xl transition-all duration-300",
                "bg-bg-secondary/40 backdrop-blur-xl border border-border-subtle",
                "hover:border-gold-primary/50 hover:shadow-glow-sm hover:translate-y-[-2px]",
                isActive && "border-gold-primary ring-2 ring-gold-primary/20 shadow-glow"
            )}
        >
            {/* Top Section: Difficulty & ID */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-gradient-to-r from-bg-tertiary/50 to-transparent">
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-md font-medium",
                        "transition-all duration-300 group-hover:scale-105",
                        song.base_difficulty === 1 && 'bg-difficulty-1/20 text-difficulty-1 border border-difficulty-1/30',
                        song.base_difficulty === 2 && 'bg-difficulty-2/20 text-difficulty-2 border border-difficulty-2/30',
                        song.base_difficulty === 3 && 'bg-difficulty-3/20 text-difficulty-3 border border-difficulty-3/30',
                        song.base_difficulty === 4 && 'bg-difficulty-4/20 text-difficulty-4 border border-difficulty-4/30'
                    )}>
                        Lvl {song.base_difficulty}
                    </span>
                </div>
                <span className="text-[10px] font-mono text-text-muted/40">
                    {song.id.slice(0, 8)}
                </span>
            </div>

            {/* Favorite Button */}
            {onToggleFavorite && (
                <button
                    onClick={onToggleFavorite}
                    className={cn(
                        "absolute top-3 right-3 z-20 p-2 rounded-full",
                        "bg-bg-primary/60 backdrop-blur-sm border border-border-subtle",
                        "hover:bg-gold-subtle hover:border-gold-primary/40",
                        "transition-all duration-300",
                        "opacity-0 group-hover:opacity-100 hover:scale-110"
                    )}
                >
                    <Heart className={cn(
                        "w-4 h-4 transition-colors",
                        isFavorite ? "fill-gold-primary text-gold-primary" : "text-text-secondary"
                    )} />
                </button>
            )}

            {/* Content */}
            <div className="flex-1 p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-4">
                    <h3 className="text-sm font-sans font-medium text-text-primary group-hover:text-cream-primary transition-colors line-clamp-2 leading-tight">
                        {song.title}
                    </h3>
                </div>

                <p className="text-xs text-text-secondary font-sans">
                    {song.composer || "Unknown Composer"}
                </p>

                {/* Tags */}
                {song.tags && song.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-auto pt-3">
                        {song.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="text-[9px] font-mono text-text-muted border border-border-subtle px-2 py-0.5 rounded-md bg-bg-tertiary/50 hover:border-gold-primary/30 transition-colors"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle bg-bg-tertiary/20">
                <div className="flex gap-3">
                    <Music2 className="w-3.5 h-3.5 text-text-muted group-hover:text-gold-primary transition-colors" />
                    <FileText className="w-3.5 h-3.5 text-text-muted group-hover:text-gold-primary transition-colors" />
                </div>
                <button className="w-7 h-7 flex items-center justify-center rounded-full bg-cream-primary text-bg-primary opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:shadow-glow-sm">
                    <Play className="w-3 h-3 fill-current" />
                </button>
            </div>

            {/* Subtle hover glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-gold-primary/0 via-transparent to-transparent opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none rounded-xl" />
        </div>
    );
}
