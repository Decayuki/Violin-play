"use client";

import { useState, useEffect } from 'react';
import { X, Play, Check, Loader2, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { YouTubeVideo, YouTubeSearchResult } from '@/types/imslp';

interface YouTubeAccompanimentSelectorProps {
    songTitle: string;
    composer?: string | null;
    onSelect: (video: YouTubeVideo) => void;
    onClose: () => void;
}

export default function YouTubeAccompanimentSelector({
    songTitle,
    composer,
    onSelect,
    onClose
}: YouTubeAccompanimentSelectorProps) {
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
    const [previewingVideo, setPreviewingVideo] = useState<string | null>(null);

    useEffect(() => {
        searchYouTube();
    }, [songTitle, composer]);

    const searchYouTube = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Build search query
            const query = composer
                ? `${songTitle} ${composer} violin accompaniment`
                : `${songTitle} violin accompaniment`;

            const response = await fetch(
                `/api/youtube/search?q=${encodeURIComponent(query)}&maxResults=8`
            );

            if (!response.ok) {
                throw new Error('Failed to search YouTube');
            }

            const data: YouTubeSearchResult = await response.json();
            setVideos(data.videos);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Search failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = (video: YouTubeVideo) => {
        setSelectedVideo(video);
    };

    const handleConfirm = () => {
        if (selectedVideo) {
            onSelect(selectedVideo);
        }
    };

    const formatDuration = (duration: string) => {
        // Parse ISO 8601 duration (PT4M46S -> 4:46)
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return duration;

        const hours = match[1] ? parseInt(match[1]) : 0;
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const seconds = match[3] ? parseInt(match[3]) : 0;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-border-subtle flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Youtube className="w-6 h-6 text-red-500" />
                            Choose Accompaniment
                        </h2>
                        <p className="text-sm text-text-secondary mt-1">
                            Select the best YouTube video for "{songTitle}"
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-bg-secondary rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-text-secondary" />
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-md text-sm text-red-500">
                            {error}
                        </div>
                    )}

                    {!isLoading && !error && videos.length === 0 && (
                        <div className="text-center py-12 text-text-secondary">
                            <Youtube className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No accompaniments found</p>
                        </div>
                    )}

                    {!isLoading && videos.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {videos.map((video) => (
                                <Card
                                    key={video.id}
                                    className={`p-4 cursor-pointer transition-all ${
                                        selectedVideo?.id === video.id
                                            ? 'ring-2 ring-gold-primary bg-gold-primary/5'
                                            : 'hover:bg-bg-secondary/50'
                                    }`}
                                    onClick={() => handleSelect(video)}
                                >
                                    <div className="flex gap-3">
                                        {/* Thumbnail */}
                                        <div className="relative flex-shrink-0">
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="w-40 h-24 object-cover rounded"
                                            />
                                            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                                                {formatDuration(video.duration)}
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setPreviewingVideo(
                                                        previewingVideo === video.id ? null : video.id
                                                    );
                                                }}
                                                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded"
                                            >
                                                <Play className="w-8 h-8 text-white" />
                                            </button>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-sm line-clamp-2 mb-1">
                                                {video.title}
                                            </h3>
                                            <p className="text-xs text-text-secondary mb-2">
                                                {video.channelTitle}
                                            </p>
                                            {selectedVideo?.id === video.id && (
                                                <div className="flex items-center gap-1 text-xs text-gold-primary">
                                                    <Check className="w-4 h-4" />
                                                    Selected
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Preview */}
                                    {previewingVideo === video.id && (
                                        <div className="mt-3">
                                            <iframe
                                                width="100%"
                                                height="200"
                                                src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                                                title={video.title}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="rounded"
                                            />
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border-subtle flex items-center justify-between">
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedVideo}
                    >
                        <Check className="w-4 h-4 mr-2" />
                        Use This Accompaniment
                    </Button>
                </div>
            </Card>
        </div>
    );
}
