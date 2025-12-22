"use client";

import { useState, useEffect, lazy, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SongWithDifficulty } from '@/types';
import { DifficultyOverride } from './DifficultyOverride';
import { useAppStore } from '@/lib/store/useAppStore';
import { useYouTubeAccompaniment } from '@/hooks/useYouTubeAccompaniment';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, Youtube } from 'lucide-react';
import Link from 'next/link';
import type { YouTubeVideo } from '@/types/imslp';

// Lazy load heavy components
const SheetViewer = lazy(() => import('./SheetViewer').then(mod => ({ default: mod.SheetViewer })));
const AudioPlayer = lazy(() => import('./AudioPlayer').then(mod => ({ default: mod.AudioPlayer })));
const YouTubeAccompanimentSelector = lazy(() => import('./YouTubeAccompanimentSelector'));

interface PracticeSessionProps {
    song: SongWithDifficulty;
    userId?: string;
}

export const PracticeSession = ({ song: initialSong, userId }: PracticeSessionProps) => {
    const searchParams = useSearchParams();
    const mode = (searchParams.get('mode') as 'backtrack' | 'cover') || 'backtrack';

    const [song, setSong] = useState(initialSong);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [showYouTubeSelector, setShowYouTubeSelector] = useState(false);
    const { setUserDifficulty } = useAppStore();
    const { needsAccompaniment, saveAccompaniment } = useYouTubeAccompaniment(song);

    const audioUrl = mode === 'backtrack' ? song.backtrack_url : song.cover_url;

    // Auto-show YouTube selector if no accompaniment
    useEffect(() => {
        if (needsAccompaniment && !showYouTubeSelector) {
            // Show selector after a small delay (better UX)
            const timer = setTimeout(() => {
                setShowYouTubeSelector(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [needsAccompaniment]);

    const handleDifficultyUpdate = (newDifficulty: number | null) => {
        setSong(prev => ({
            ...prev,
            user_difficulty: newDifficulty,
            effective_difficulty: newDifficulty ?? prev.base_difficulty
        }));
        setUserDifficulty(song.id, newDifficulty);
    };

    const handleYouTubeSelect = async (video: YouTubeVideo) => {
        const success = await saveAccompaniment(video);
        if (success) {
            // Update local song state
            setSong(prev => ({
                ...prev,
                youtube_video_id: video.id,
                youtube_title: video.title,
                youtube_thumbnail: video.thumbnail,
            }));
            setShowYouTubeSelector(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] -m-6">
            {/* Main Sheet Area */}
            <div className="flex-1 relative bg-gray-900">
                {song.pdf_url ? (
                    <Suspense fallback={
                        <div className="flex items-center justify-center h-full">
                            <div className="text-text-muted">Loading sheet music...</div>
                        </div>
                    }>
                        <SheetViewer pdfUrl={song.pdf_url} songId={song.id} userId={userId} />
                    </Suspense>
                ) : (
                    <div className="flex items-center justify-center h-full text-text-muted">
                        No sheet music available
                    </div>
                )}
            </div>

            {/* Sidebar Toggle (Mobile/Desktop) */}
            <button
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="absolute top-1/2 right-0 transform -translate-y-1/2 z-20 bg-bg-elevated border border-border-default p-1 rounded-l-md shadow-lg"
                style={{ right: isSidebarOpen ? '320px' : '0' }}
            >
                {isSidebarOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Right Sidebar */}
            <div
                className={cn(
                    "w-80 bg-bg-secondary border-l border-border-default flex flex-col transition-all duration-300 ease-in-out z-10",
                    !isSidebarOpen && "w-0 overflow-hidden border-none"
                )}
            >
                <div className="p-4 border-b border-border-subtle">
                    <div className="flex items-center justify-between mb-2">
                        <Link href="/" className="text-xs text-text-secondary hover:text-text-primary">
                            ← Back to Library
                        </Link>
                        <button
                            onClick={() => setShowYouTubeSelector(true)}
                            className="p-1 hover:bg-bg-tertiary rounded transition-colors"
                            title="Find YouTube accompaniment"
                        >
                            <Youtube className="w-4 h-4 text-red-500" />
                        </button>
                    </div>
                    <h2 className="font-bold text-lg leading-tight">{song.title}</h2>
                    <p className="text-sm text-text-secondary">{song.composer}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Audio Player */}
                    {audioUrl ? (
                        <Suspense fallback={<div className="h-32 bg-bg-tertiary animate-pulse rounded-lg" />}>
                            <AudioPlayer
                                audioUrl={audioUrl}
                                songTitle={song.title}
                                mode={mode}
                            />
                        </Suspense>
                    ) : song.youtube_video_id ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">YouTube Accompaniment</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowYouTubeSelector(true)}
                                >
                                    Change
                                </Button>
                            </div>
                            <iframe
                                width="100%"
                                height="200"
                                src={`https://www.youtube.com/embed/${song.youtube_video_id}`}
                                title={song.youtube_title || 'YouTube accompaniment'}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="rounded-lg"
                            />
                        </div>
                    ) : (
                        <div className="p-4 bg-bg-tertiary rounded-lg text-center space-y-3">
                            <p className="text-sm text-text-muted">
                                No audio available for {mode} mode
                            </p>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowYouTubeSelector(true)}
                            >
                                <Youtube className="w-4 h-4 mr-2" />
                                Find YouTube Accompaniment
                            </Button>
                        </div>
                    )}

                    {/* Difficulty Override */}
                    <DifficultyOverride
                        songId={song.id}
                        baseDifficulty={song.base_difficulty}
                        userDifficulty={song.user_difficulty ?? null}
                        onUpdate={handleDifficultyUpdate}
                    />

                    {/* Metronome / Tuner placeholders could go here */}
                </div>
            </div>

            {/* YouTube Accompaniment Selector Modal */}
            {showYouTubeSelector && (
                <Suspense fallback={null}>
                    <YouTubeAccompanimentSelector
                        songTitle={song.title}
                        composer={song.composer}
                        onSelect={handleYouTubeSelect}
                        onClose={() => setShowYouTubeSelector(false)}
                    />
                </Suspense>
            )}
        </div >
    );
};
