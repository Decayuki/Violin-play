import { SongWithDifficulty } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StarRating } from '@/components/ui/StarRating';
import { Headphones, FileText, Music } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SongCardProps {
    song: SongWithDifficulty;
    isSelected: boolean;
    onClick: () => void;
}

export const SongCard = ({ song, isSelected, onClick }: SongCardProps) => {
    return (
        <Card
            hover
            onClick={onClick}
            className={cn(
                "relative flex flex-col h-full transition-all",
                isSelected && "ring-2 ring-accent-500 border-accent-500 bg-accent-500/5"
            )}
        >
            <div className="flex flex-wrap gap-2 mb-3">
                {song.tags?.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="subtle" size="sm">
                        {tag}
                    </Badge>
                ))}
            </div>

            <h3 className="text-lg font-bold text-text-primary mb-1 line-clamp-1">
                {song.title}
            </h3>
            <p className="text-sm text-text-secondary mb-4 line-clamp-1">
                {song.composer || 'Unknown Composer'}
            </p>

            <div className="mt-auto flex items-center justify-between">
                <StarRating value={song.effective_difficulty} readonly size="sm" />

                <div className="flex gap-2 text-text-muted">
                    {song.backtrack_url && <Headphones className="w-4 h-4" />}
                    {song.pdf_url && <FileText className="w-4 h-4" />}
                </div>
            </div>
        </Card>
    );
};
