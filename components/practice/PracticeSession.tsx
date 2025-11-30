"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SongWithDifficulty } from '@/types';
import { SheetViewer } from './SheetViewer';
import { AudioPlayer } from './AudioPlayer';
import { DifficultyOverride } from './DifficultyOverride';
import { useAppStore } from '@/lib/store/useAppStore';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface PracticeSessionProps {
    song: SongWithDifficulty;
}

export const PracticeSession = ({ song: initialSong }: PracticeSessionProps) => {
    const searchParams = useSearchParams();
    const mode = (searchParams.get('mode') as 'backtrack' | 'cover') || 'backtrack';

    const [song, setSong] = useState(initialSong);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const { setUserDifficulty } = useAppStore();

    const audioUrl = mode === 'backtrack' ? song.backtrack_url : song.cover_url;

    const handleDifficultyUpdate = (newDifficulty: number | null) => {
        setSong(prev => ({
            ...prev,
            user_difficulty: newDifficulty,
            effective_difficulty: newDifficulty ?? prev.base_difficulty
        }));
        setUserDifficulty(song.id, newDifficulty);
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] -m-6">
            {/* Main Sheet Area */}
            <div className="flex-1 relative bg-gray-900">
                {song.pdf_url ? (
                    <SheetViewer pdfUrl={song.pdf_url} />
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
                    <Link href="/" className="text-xs text-text-secondary hover:text-text-primary mb-2 block">
                        ← Back to Library
                    </Link>
                    <h2 className="font-bold text-lg leading-tight">{song.title}</h2>
                    <p className="text-sm text-text-secondary">{song.composer}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Audio Player */}
                    {audioUrl ? (
                        <AudioPlayer
                            audioUrl={audioUrl}
                            songTitle={song.title}
                            mode={mode}
                        />
                    ) : (
                        <div className="p-4 bg-bg-tertiary rounded-lg text-center text-sm text-text-muted">
                            No audio available for {mode} mode
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
        </div>
    );
};
