import { SongWithDifficulty } from '@/types';
import { SongCard } from './SongCard';
import { Loader2 } from 'lucide-react';

interface SongSelectorProps {
    songs: SongWithDifficulty[];
    selectedSongId: string | null;
    onSelect: (songId: string) => void;
    loading?: boolean;
    emptyMessage?: string;
}

export const SongSelector = ({
    songs,
    selectedSongId,
    onSelect,
    loading,
    emptyMessage = "No songs found for this level."
}: SongSelectorProps) => {
    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
            </div>
        );
    }

    if (songs.length === 0) {
        return (
            <div className="text-center py-12 text-text-muted">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {songs.map(song => (
                <SongCard
                    key={song.id}
                    song={song}
                    isSelected={selectedSongId === song.id}
                    onClick={() => onSelect(song.id)}
                />
            ))}
        </div>
    );
};
