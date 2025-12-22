"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Music, Youtube } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import IMSLPSearch from '@/components/library/IMSLPSearch';
import YouTubePlayer from '@/components/player/YouTubePlayer';
import type { IMSLPWork, YouTubeVideo, YouTubeSearchResult } from '@/types/imslp';
import { createClient } from '@/lib/supabase/client';

type ImportStep = 'search' | 'select-pdf' | 'youtube' | 'importing';

export default function ImportPage() {
    const router = useRouter();
    const supabase = createClient();

    const [step, setStep] = useState<ImportStep>('search');
    const [selectedWork, setSelectedWork] = useState<IMSLPWork | null>(null);
    const [youtubeResults, setYoutubeResults] = useState<YouTubeVideo[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
    const [isLoadingYoutube, setIsLoadingYoutube] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSelectWork = async (work: IMSLPWork) => {
        setSelectedWork(work);
        setError(null);

        // Automatically search for YouTube accompaniments
        setIsLoadingYoutube(true);
        try {
            const response = await fetch(
                `/api/youtube/search?q=${encodeURIComponent(`${work.title} ${work.composer}`)}&maxResults=5`
            );

            if (!response.ok) {
                throw new Error('Failed to search YouTube');
            }

            const data: YouTubeSearchResult = await response.json();
            setYoutubeResults(data.videos);
            setStep('youtube');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'YouTube search failed');
            setYoutubeResults([]);
        } finally {
            setIsLoadingYoutube(false);
        }
    };

    const handleSelectVideo = (video: YouTubeVideo) => {
        setSelectedVideo(video);
    };

    const handleImport = async () => {
        if (!selectedWork) return;

        setIsImporting(true);
        setError(null);

        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('You must be logged in to import');
            }

            // For now, we'll create a placeholder entry
            // In a full implementation, we'd download the PDF from IMSLP
            const { data: song, error: insertError } = await supabase
                .from('songs')
                .insert({
                    title: selectedWork.title,
                    composer: selectedWork.composer,
                    imslp_id: selectedWork.id,
                    imslp_url: selectedWork.url,
                    youtube_video_id: selectedVideo?.id,
                    youtube_title: selectedVideo?.title,
                    youtube_thumbnail: selectedVideo?.thumbnail,
                    import_source: 'imslp',
                    user_id: user.id,
                    // Note: pdf_url would need to be populated by downloading from IMSLP
                    // This is a placeholder implementation
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // Redirect to the song page
            router.push(`/practice/${song.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Import failed');
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-primary p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Import from IMSLP</h1>
                        <p className="text-text-secondary mt-1">
                            Search and import public domain sheet music
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-md text-sm text-red-500">
                        {error}
                    </div>
                )}

                {step === 'search' && (
                    <Card className="p-6">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                <Music className="w-5 h-5" />
                                Search IMSLP Library
                            </h2>
                            <p className="text-sm text-text-secondary">
                                Search for sheet music from the International Music Score Library Project
                            </p>
                        </div>
                        <IMSLPSearch onSelectWork={handleSelectWork} />
                    </Card>
                )}

                {step === 'youtube' && selectedWork && (
                    <div className="space-y-6">
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Selected Work</h2>
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg">{selectedWork.title}</h3>
                                    <p className="text-text-secondary">{selectedWork.composer}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setStep('search');
                                        setSelectedWork(null);
                                        setYoutubeResults([]);
                                        setSelectedVideo(null);
                                    }}
                                >
                                    Change
                                </Button>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                    <Youtube className="w-5 h-5 text-red-500" />
                                    Select YouTube Accompaniment (Optional)
                                </h2>
                                <p className="text-sm text-text-secondary">
                                    Choose a video to play alongside the sheet music
                                </p>
                            </div>

                            {isLoadingYoutube ? (
                                <div className="text-center py-8 text-text-secondary">
                                    Searching YouTube...
                                </div>
                            ) : youtubeResults.length > 0 ? (
                                <div className="space-y-3">
                                    {youtubeResults.map((video) => (
                                        <Card
                                            key={video.id}
                                            className={`p-4 cursor-pointer transition-all ${
                                                selectedVideo?.id === video.id
                                                    ? 'ring-2 ring-primary bg-primary/5'
                                                    : 'hover:bg-bg-secondary/50'
                                            }`}
                                            onClick={() => handleSelectVideo(video)}
                                        >
                                            <div className="flex gap-4">
                                                <img
                                                    src={video.thumbnail}
                                                    alt={video.title}
                                                    className="w-32 h-20 object-cover rounded"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-sm line-clamp-2">
                                                        {video.title}
                                                    </h3>
                                                    <p className="text-xs text-text-secondary mt-1">
                                                        {video.channelTitle}
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-text-secondary">
                                    No YouTube results found
                                </div>
                            )}

                            <div className="mt-6 flex gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={() => handleImport()}
                                    className="flex-1"
                                >
                                    Skip YouTube
                                </Button>
                                <Button
                                    onClick={() => handleImport()}
                                    disabled={!selectedVideo || isImporting}
                                    isLoading={isImporting}
                                    className="flex-1"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Import with Video
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
