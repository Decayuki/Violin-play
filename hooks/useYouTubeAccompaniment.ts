import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { YouTubeVideo } from '@/types/imslp';

interface Song {
    id: string;
    title: string;
    composer?: string | null;
    backtrack_url?: string | null;
    youtube_video_id?: string | null;
    youtube_title?: string | null;
    youtube_thumbnail?: string | null;
}

export function useYouTubeAccompaniment(song: Song) {
    const [needsAccompaniment, setNeedsAccompaniment] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        // Check if song needs accompaniment
        const needsYouTube = !song.backtrack_url && !song.youtube_video_id;
        setNeedsAccompaniment(needsYouTube);
    }, [song]);

    const saveAccompaniment = async (video: YouTubeVideo) => {
        setIsSaving(true);
        setError(null);

        try {
            const { error: updateError } = await supabase
                .from('songs')
                .update({
                    youtube_video_id: video.id,
                    youtube_title: video.title,
                    youtube_thumbnail: video.thumbnail,
                })
                .eq('id', song.id);

            if (updateError) {
                throw updateError;
            }

            // Update local state
            setNeedsAccompaniment(false);

            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to save accompaniment';
            setError(errorMessage);
            console.error('Error saving accompaniment:', err);
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    return {
        needsAccompaniment,
        isSaving,
        error,
        saveAccompaniment,
    };
}
