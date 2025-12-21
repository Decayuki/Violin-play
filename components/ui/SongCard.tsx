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
                "group relative flex flex-col bg-bg-secondary border border-border-subtle hover:border-border-strong transition-colors duration-200 overflow-hidden cursor-pointer",
                isActive && "border-border-strong ring-1 ring-border-strong"
            )}
        >
            {/* Top Section: Difficulty & ID (Technical Look) */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-bg-tertiary/30">
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm 
            ${song.base_difficulty === 1 ? 'bg-difficulty-1/20 text-difficulty-1' : ''}
            ${song.base_difficulty === 2 ? 'bg-difficulty-2/20 text-difficulty-2' : ''}
            ${song.base_difficulty === 3 ? 'bg-difficulty-3/20 text-difficulty-3' : ''}
            ${song.base_difficulty === 4 ? 'bg-difficulty-4/20 text-difficulty-4' : ''}
          `}>
                        Lvl {song.base_difficulty}
                    </span>
                </div>
                <span className="text-[10px] font-mono text-text-muted opacity-50">
                    {song.id.slice(0, 8)}
                </span>
            </div>

            {/* Favorite Button */}
            {onToggleFavorite && (
                <button
                    onClick={onToggleFavorite}
                    className="absolute top-2 right-2 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all opacity-0 group-hover:opacity-100"
                >
                    <Heart className={cn("w-4 h-4", isFavorite ? "fill-gold-primary text-gold-primary" : "text-white")} />
                </button>
            )}

            {/* Hover Overlay */}
            <div className="flex-1 p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-4">
                    <h3 className="text-sm font-medium text-text-primary group-hover:text-white transition-colors line-clamp-2">
                        {song.title}
                    </h3>
                </div>

                <p className="text-xs text-text-secondary font-mono">
                    {song.composer || "Unknown Composer"}
                </p>

                {/* Tags */}
                {song.tags && song.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-auto pt-3">
                        {song.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-[9px] font-mono text-text-muted border border-border-subtle px-1 py-0.5">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Actions (Placeholder for now) */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle bg-bg-tertiary/10">
                <div className="flex gap-3">
                    {/* Visual indicators only for now */}
                    <Music2 className="w-3 h-3 text-text-muted" />
                    <FileText className="w-3 h-3 text-text-muted" />
                </div>
                <button className="w-6 h-6 flex items-center justify-center rounded-full bg-text-primary text-bg-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-3 h-3 fill-current" />
                </button>
            </div>
        </div>
    );
}
