"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { GripVertical, ChevronLeft, ChevronRight, Music2, Maximize2, Minimize2, Mic2, PlayCircle, Layers, Mic, MicOff, Search, Heart, Youtube } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import SongCard from "@/components/ui/SongCard";
import PdfViewer from "@/components/ui/PdfViewer";
import AudioPlayer from '../player/AudioPlayer';
import MiniPlayer from '../player/MiniPlayer';
import TunerWidget from '../tools/TunerWidget';
import { SearchControls } from '../ui/SearchControls';
import YouTubeAccompanimentSelector from '../practice/YouTubeAccompanimentSelector';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTuner } from '@/hooks/useTuner';
import { useYouTubeAccompaniment } from '@/hooks/useYouTubeAccompaniment';
import type { YouTubeVideo } from '@/types/imslp';

// Types
interface Song {
    id: string;
    title: string;
    composer: string | null;
    base_difficulty: number;
    tags: string[] | null;
    cover_url: string | null;
    pdf_url: string | null;
    backtrack_url: string | null;
    youtube_video_id?: string | null;
    youtube_title?: string | null;
    youtube_thumbnail?: string | null;
}

interface VerticalFlowProps {
    songs: Song[];
}

type PanelId = 0 | 1 | 2 | 3;

export default function VerticalFlow({ songs }: VerticalFlowProps) {
    const [activePanel, setActivePanel] = useState<PanelId>(0);
    const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);
    const [selectedMode, setSelectedMode] = useState<"backtrack" | "cover" | "youtube" | null>(null);
    const [showYouTubeSelector, setShowYouTubeSelector] = useState(false);

    // Filters
    const [filterBacktrack, setFilterBacktrack] = useState(false);
    const [filterCover, setFilterCover] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<'all' | 'title' | 'author'>('all');

    const [isPlaying, setIsPlaying] = useState(false);
    const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
    const [scrollSpeed, setScrollSpeed] = useState(0.5);
    // Player Resizing State (Width of the Player section)
    const [playerWidth, setPlayerWidth] = useState(400); // Initial width in px
    const [selectionWidth, setSelectionWidth] = useState(350); // Initial width for selection panel


    const [playbackRate, setPlaybackRate] = useState(1);
    const [isFocusMode, setIsFocusMode] = useState(false);

    // Derived state for MiniPlayer
    const showMiniPlayer = playerWidth < 320 || isFocusMode;

    // ... inside component

    // Favorites State
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const supabase = createClient();

    // Fetch favorites and user on load
    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            setUserId(user.id);

            const { data, error } = await supabase
                .from('favorites')
                .select('song_id')
                .eq('user_id', user.id);

            if (error) {
                console.error('Error fetching favorites:', error);
                return;
            }

            if (data) {
                setFavorites(new Set(data.map(f => f.song_id)));
            }
        };

        fetchUserData();
    }, []);

    // Tuner Hook
    const { isActive: isTunerActive, note, cents, frequency, hasSignal, startTuner, stopTuner } = useTuner();

    const toggleTuner = () => {
        if (isTunerActive) stopTuner();
        else startTuner();
    };

    const toggleFavorite = async (songId: string) => {
        // Optimistic Update
        setFavorites(prev => {
            const next = new Set(prev);
            if (next.has(songId)) next.delete(songId);
            else next.add(songId);
            return next;
        });

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const isFavorite = favorites.has(songId); // State before toggle (wait, this might be tricky with closure)
        // Better to check the Set *after* toggle? No, we need to know what action to take.
        // Let's use the previous state logic or just check if it WAS in the set.

        // Actually, since we already updated the state optimistically, we need to know if we added or removed.
        // Let's check if it WAS there.
        const wasFavorite = favorites.has(songId);

        if (wasFavorite) {
            // Remove
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('user_id', user.id)
                .eq('song_id', songId);

            if (error) {
                console.error('Error removing favorite:', error);
                // Revert state if error
                setFavorites(prev => {
                    const next = new Set(prev);
                    next.add(songId);
                    return next;
                });
            }
        } else {
            // Add
            const { error } = await supabase
                .from('favorites')
                .insert({ user_id: user.id, song_id: songId });

            if (error) {
                console.error('Error adding favorite:', error);
                // Revert state if error
                setFavorites(prev => {
                    const next = new Set(prev);
                    next.delete(songId);
                    return next;
                });
            }
        }
    };

    // Toggle Focus Mode
    const toggleFocusMode = () => {
        setIsFocusMode(!isFocusMode);
        if (!isFocusMode) {
            // Enter Focus Mode: Collapse panels
            setSelectionWidth(0);
            setPlayerWidth(0);
        } else {
            // Exit Focus Mode: Restore defaults
            setSelectionWidth(350);
            setPlayerWidth(450);
        }
    };

    // Keyboard Shortcuts
    useKeyboardShortcuts({
        onPlayPause: () => setIsPlaying(prev => !prev),
        onToggleFocus: toggleFocusMode,
    });
    const isResizing = useRef(false);

    // Filter songs based on selected level and active filters
    const filteredSongs = selectedLevel
        ? songs.filter(s => {
            const levelMatch = s.base_difficulty === selectedLevel;
            const pdfMatch = !!s.pdf_url; // Always require PDF
            const backtrackMatch = filterBacktrack ? !!s.backtrack_url : true;
            const coverMatch = filterCover ? !!s.cover_url : true;

            // Search Logic
            let searchMatch = true;
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const titleMatch = s.title.toLowerCase().includes(query);
                const authorMatch = s.composer?.toLowerCase().includes(query) || false;

                if (activeFilter === 'title') searchMatch = titleMatch;
                else if (activeFilter === 'author') searchMatch = authorMatch;
                else searchMatch = titleMatch || authorMatch;
            }

            return levelMatch && pdfMatch && backtrackMatch && coverMatch && searchMatch;
        })
        : [];

    const handleLevelSelect = (level: number) => {
        setSelectedLevel(level);
        setActivePanel(1); // Move to Song selection
    };

    const handleSongSelect = (song: Song) => {
        setSelectedSong(song);
        setActivePanel(2); // Move to Mode selection
        setIsPlaying(false); // Reset play state on new song
    };

    const handleModeSelect = (mode: "backtrack" | "cover" | "youtube") => {
        if (mode === "youtube") {
            setShowYouTubeSelector(true);
            setSelectedMode(null); // Don't set mode yet, wait for YouTube selection
        } else {
            setSelectedMode(mode);
            setActivePanel(3); // Move to Player
        }
    };

    const handleYouTubeSelect = async (video: YouTubeVideo) => {
        if (!selectedSong) return;

        // Update local song state immediately (works without auth)
        setSelectedSong(prev => prev ? ({
            ...prev,
            youtube_video_id: video.id,
            youtube_title: video.title,
            youtube_thumbnail: video.thumbnail,
        } as Song) : null);

        setSelectedMode("youtube");
        setShowYouTubeSelector(false);
        setActivePanel(3); // Move to Player

        // Try to save to database (optional, fails gracefully if not authenticated)
        try {
            const supabase = createClient();
            await supabase
                .from('songs')
                .update({
                    youtube_video_id: video.id,
                    youtube_title: video.title,
                    youtube_thumbnail: video.thumbnail,
                })
                .eq('id', selectedSong.id);
        } catch (error) {
            // Silently fail if not authenticated - video will still work in this session
            console.log('Not authenticated - YouTube selection saved for this session only');
        }
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const toggleAutoScroll = () => {
        setIsAutoScrollEnabled(!isAutoScrollEnabled);
    };

    const adjustSpeed = (delta: number) => {
        setScrollSpeed(prev => Math.max(0.1, Math.min(5.0, Number((prev + delta).toFixed(1)))));
    };

    // Resizing Logic (Horizontal)
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing.current) return;
            // Calculate new width (inverse because it's from right)
            const newWidth = window.innerWidth - e.clientX;
            // Clamp values (min 300px, max 60% of screen)
            if (newWidth > 300 && newWidth < window.innerWidth * 0.6) {
                setPlayerWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            isResizing.current = false;
            document.body.style.cursor = 'default';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const startResizing = (e: React.MouseEvent) => {
        isResizing.current = true;
        document.body.style.cursor = 'col-resize';
        e.preventDefault();
    };

    return (
        <div className="flex w-full h-[calc(100vh-4rem)] overflow-hidden bg-transparent">

            {/* PANEL 1: LEVEL SELECTION */}
            <Panel
                index={0}
                activePanel={activePanel}
                onClick={() => setActivePanel(0)}
                title="DIFFICULTY"
                icon={<Layers className="w-6 h-6" />}
                headerImage="/vignettes/tryBandeauSlider.png"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-8 max-w-4xl mx-auto w-full h-full content-center">
                    {[1, 2, 3, 4].map((level) => (
                        <button
                            key={level}
                            onClick={(e) => { e.stopPropagation(); handleLevelSelect(level); }}
                            className={`
                group relative flex flex-col items-center justify-center h-48 border border-border-subtle 
                hover:border-text-primary transition-all duration-300 bg-bg-secondary/10 backdrop-blur-md
                ${selectedLevel === level ? 'border-text-primary bg-bg-secondary/40 shadow-[0_0_30px_rgba(212,175,55,0.1)]' : ''}
              `}
                        >
                            <span className="text-6xl font-mono font-bold text-border-strong group-hover:text-text-primary transition-colors">
                                {level}
                            </span>
                            <span className="text-sm font-mono tracking-widest mt-2 text-text-secondary uppercase">
                                {level === 1 ? "Easy" : level === 2 ? "Medium" : level === 3 ? "Hard" : "Expert"}
                            </span>
                        </button>
                    ))}
                </div>
            </Panel>

            {/* PANEL 2: SONG SELECTION */}
            <Panel
                index={1}
                activePanel={activePanel}
                onClick={() => selectedLevel && setActivePanel(1)}
                title="SELECTION"
                icon={<Music2 className="w-6 h-6" />}
                disabled={!selectedLevel}
                headerImage="/vignettes/tryBandeauSlider.png"
            >
                <div className="h-full overflow-y-auto p-8">
                    {/* Search Controls */}
                    <SearchControls
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                    />

                    {/* Filter Toggles */}
                    <div className="flex flex-wrap items-center justify-end gap-4 mb-6">
                        <span className="text-xs font-mono text-text-muted uppercase tracking-widest mr-2">Filters:</span>

                        {/* Backtrack Filter */}
                        <button
                            onClick={(e) => { e.stopPropagation(); setFilterBacktrack(!filterBacktrack); }}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all border
                                ${filterBacktrack
                                    ? 'bg-gold-primary/10 text-gold-primary border-gold-primary'
                                    : 'bg-bg-tertiary text-text-secondary border-border-subtle hover:border-text-muted'}
                            `}
                        >
                            <div className={`w-2 h-2 rounded-full ${filterBacktrack ? 'bg-gold-primary animate-pulse' : 'bg-text-muted'}`} />
                            Backtrack
                        </button>

                        {/* Cover Filter */}
                        <button
                            onClick={(e) => { e.stopPropagation(); setFilterCover(!filterCover); }}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all border
                                ${filterCover
                                    ? 'bg-gold-primary/10 text-gold-primary border-gold-primary'
                                    : 'bg-bg-tertiary text-text-secondary border-border-subtle hover:border-text-muted'}
                            `}
                        >
                            <div className={`w-2 h-2 rounded-full ${filterCover ? 'bg-gold-primary animate-pulse' : 'bg-text-muted'}`} />
                            Full Cover
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                        {filteredSongs.map(song => (
                            <div key={song.id} className="cursor-pointer">
                                <SongCard
                                    song={song}
                                    onClick={() => handleSongSelect(song)}
                                    isFavorite={favorites.has(song.id)}
                                    onToggleFavorite={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(song.id);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    {filteredSongs.length === 0 && (
                        <div className="text-center text-text-muted font-mono mt-20">
                            NO DATA FOR LEVEL {selectedLevel}
                        </div>
                    )}
                </div>
            </Panel>

            {/* PANEL 3: MODE SELECTION */}
            <Panel
                index={2}
                activePanel={activePanel}
                onClick={() => selectedSong && setActivePanel(2)}
                title="MODE"
                icon={<Mic2 className="w-6 h-6" />}
                disabled={!selectedSong}
                headerImage="/vignettes/tryBandeauSlider.png"
            >
                <div className="flex flex-col md:flex-row gap-8 items-center justify-center h-full p-8">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (selectedSong?.backtrack_url) handleModeSelect("backtrack");
                        }}
                        disabled={!selectedSong?.backtrack_url}
                        className={`w-full md:w-1/4 aspect-square border flex flex-col items-center justify-center gap-4 transition-all group
                            ${selectedSong?.backtrack_url
                                ? 'border-border-subtle hover:border-text-primary bg-bg-secondary cursor-pointer'
                                : 'border-border-subtle bg-bg-secondary/30 cursor-not-allowed opacity-50'
                            }`}
                    >
                        <Music2 className={`w-12 h-12 ${selectedSong?.backtrack_url ? 'text-text-muted group-hover:text-text-primary' : 'text-text-muted/30'}`} />
                        <div className="text-center">
                            <h3 className={`text-xl font-bold ${selectedSong?.backtrack_url ? 'text-text-primary' : 'text-text-muted/50'}`}>PRACTICE</h3>
                            <p className="text-sm text-text-secondary font-mono mt-1">
                                {selectedSong?.backtrack_url ? 'Backtrack Only' : 'Not Available'}
                            </p>
                        </div>
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (selectedSong?.cover_url) handleModeSelect("cover");
                        }}
                        disabled={!selectedSong?.cover_url}
                        className={`w-full md:w-1/4 aspect-square border flex flex-col items-center justify-center gap-4 transition-all group
                            ${selectedSong?.cover_url
                                ? 'border-border-subtle hover:border-text-primary bg-bg-secondary cursor-pointer'
                                : 'border-border-subtle bg-bg-secondary/30 cursor-not-allowed opacity-50'
                            }`}
                    >
                        <PlayCircle className={`w-12 h-12 ${selectedSong?.cover_url ? 'text-text-muted group-hover:text-text-primary' : 'text-text-muted/30'}`} />
                        <div className="text-center">
                            <h3 className={`text-xl font-bold ${selectedSong?.cover_url ? 'text-text-primary' : 'text-text-muted/50'}`}>LISTEN</h3>
                            <p className="text-sm text-text-secondary font-mono mt-1">
                                {selectedSong?.cover_url ? 'Full Cover' : 'Not Available'}
                            </p>
                        </div>
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); handleModeSelect("youtube"); }}
                        className="w-full md:w-1/4 aspect-square border border-border-subtle hover:border-red-500 bg-bg-secondary flex flex-col items-center justify-center gap-4 transition-all group cursor-pointer"
                    >
                        <Youtube className="w-12 h-12 text-red-500 group-hover:text-red-400" />
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-text-primary">YOUTUBE</h3>
                            <p className="text-sm text-text-secondary font-mono mt-1">Find Accompaniment</p>
                        </div>
                    </button>
                </div>
            </Panel>

            {/* PANEL 4: PLAYER (Special Layout - Vertical Split) */}
            <Panel
                index={3}
                activePanel={activePanel}
                onClick={() => selectedMode && setActivePanel(3)}
                title="PLAYER"
                icon={<PlayCircle className="w-6 h-6" />}
                disabled={!selectedMode}
                isPlayerPanel={true}
                headerImage="/vignettes/tryBandeauSlider.png"
            >
                <div className="flex h-full w-full relative">
                    {/* Sheet Music Area (Left - Takes remaining space) */}
                    <div className="flex-1 bg-bg-secondary/50 relative overflow-hidden flex flex-col">
                        {selectedSong?.pdf_url ? (
                            <div className="w-full h-full">
                                <PdfViewer
                                    url={selectedSong.pdf_url}
                                    songId={selectedSong.id}
                                    userId={userId}
                                    isPlaying={isPlaying}
                                    isAutoScrollEnabled={isAutoScrollEnabled}
                                    scrollSpeed={scrollSpeed}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-text-muted font-mono">
                                NO SHEET MUSIC AVAILABLE
                            </div>
                        )}
                    </div>

                    {/* Resizer Handle (Vertical) */}
                    <div
                        onMouseDown={startResizing}
                        className="w-2 bg-border-subtle hover:bg-text-primary cursor-col-resize flex flex-col items-center justify-center transition-colors z-10"
                    >
                        <GripVertical className="w-4 h-4 text-text-muted/50" />
                    </div>

                    {/* Player Area (Right - Resizable) */}
                    <div
                        style={{ width: playerWidth }}
                        className="bg-bg-secondary border-l border-border-subtle relative flex flex-col h-full"
                    >
                        <div
                            className="transition-all duration-300 ease-in-out border-l border-border-subtle bg-bg-secondary/30 backdrop-blur-sm relative"
                            style={{ width: `${playerWidth}px` }} // Changed to px as per original playerWidth state
                        >
                            {/* Resize Handle (Left side of player panel) */}
                            <div
                                className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-text-primary z-20 transition-colors" // Changed hover color to match existing
                                onMouseDown={startResizing} // Changed to existing startResizing handler
                            />

                            <div className="h-full flex flex-col p-6 gap-6 overflow-y-auto scrollbar-hide">
                                <div className="h-full flex flex-col">
                                    {/* Tuner Widget (Integrated) */}
                                    <TunerWidget
                                        isActive={isTunerActive}
                                        note={note}
                                        cents={cents}
                                        frequency={frequency}
                                        hasSignal={hasSignal}
                                        onToggle={toggleTuner}
                                    />

                                    <div className="flex-1 overflow-y-auto p-8">
                                        {/* Song Info */}
                                        <div className="mb-8 text-center">
                                            <h2 className="text-3xl font-bold tracking-tighter mb-2">{selectedSong?.title}</h2>
                                            <p className="text-md text-text-secondary font-mono">{selectedSong?.composer}</p>
                                        </div>

                                        {/* Audio Player Component or YouTube Iframe */}
                                        {selectedMode === 'youtube' && selectedSong?.youtube_video_id ? (
                                            <div className="space-y-4">
                                                <iframe
                                                    width="100%"
                                                    height="300"
                                                    src={`https://www.youtube.com/embed/${selectedSong.youtube_video_id}`}
                                                    title={selectedSong.youtube_title || 'YouTube accompaniment'}
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    className="rounded-lg"
                                                />
                                                <p className="text-xs text-text-secondary text-center">
                                                    {selectedSong.youtube_title}
                                                </p>
                                            </div>
                                        ) : (
                                            <AudioPlayer
                                                url={selectedMode === 'backtrack' ? selectedSong?.backtrack_url || null : selectedSong?.cover_url || null}
                                                coverUrl={selectedSong?.cover_url || null}
                                                isPlaying={isPlaying}
                                                onPlayStateChange={setIsPlaying}
                                                playbackRate={playbackRate}
                                                onPlaybackRateChange={setPlaybackRate}
                                            />
                                        )}
                                    </div>

                                    {/* Auto-scroll Controls (Moved from original player UI) */}
                                    <div className="mt-8 pt-8 border-t border-border-subtle">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-sm font-mono text-text-secondary">AUTO-SCROLL</span>
                                            <button
                                                onClick={toggleAutoScroll}
                                                className={`
                                                w-12 h-6 rounded-full p-1 transition-colors duration-300
                                                ${isAutoScrollEnabled ? 'bg-text-primary' : 'bg-bg-tertiary'}
                                            `}
                                            >
                                                <div className={`
                                                w-4 h-4 rounded-full bg-bg-primary shadow-sm transition-transform duration-300
                                                ${isAutoScrollEnabled ? 'translate-x-6' : 'translate-x-0'}
                                            `} />
                                            </button>
                                        </div>

                                        <div className={`transition-opacity duration-300 ${isAutoScrollEnabled ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-mono text-text-muted">SPEED</span>
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => adjustSpeed(-0.1)}
                                                        className="w-8 h-8 rounded border border-border-subtle flex items-center justify-center hover:bg-bg-tertiary"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="font-mono w-12 text-center">{scrollSpeed.toFixed(1)}</span>
                                                    <button
                                                        onClick={() => adjustSpeed(0.1)}
                                                        className="w-8 h-8 rounded border border-border-subtle flex items-center justify-center hover:bg-bg-tertiary"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Panel>

            {/* Mini Player Overlay */}
            {showMiniPlayer && selectedSong && (
                <MiniPlayer
                    title={selectedSong.title}
                    composer={selectedSong.composer || 'Unknown Composer'}
                    coverUrl={selectedSong.cover_url || null}
                    isPlaying={isPlaying}
                    onPlayPause={() => setIsPlaying(!isPlaying)}
                    onExpand={() => {
                        setIsFocusMode(false);
                        setPlayerWidth(450);
                    }}
                    isTunerActive={isTunerActive}
                    tunerNote={note}
                    tunerCents={cents}
                    onToggleTuner={toggleTuner}
                />
            )}

            {/* Floating Controls (Focus Mode Only) */}
            <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-3">
                <button
                    onClick={toggleFocusMode}
                    className="p-3 rounded-full bg-bg-secondary/80 backdrop-blur-md border border-white/10 text-text-primary hover:bg-gold-primary hover:text-bg-primary transition-all shadow-xl"
                    title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
                >
                    {isFocusMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
            </div>

            {/* YouTube Accompaniment Selector Modal */}
            {showYouTubeSelector && selectedSong && (
                <YouTubeAccompanimentSelector
                    songTitle={selectedSong.title}
                    composer={selectedSong.composer}
                    onSelect={handleYouTubeSelect}
                    onClose={() => setShowYouTubeSelector(false)}
                />
            )}

        </div>
    );
}

// Sub-component for individual panels
function Panel({
    index,
    activePanel,
    onClick,
    title,
    icon,
    children,
    disabled = false,
    isPlayerPanel = false,
    headerImage
}: {
    index: number;
    activePanel: number;
    onClick: () => void;
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    disabled?: boolean;
    isPlayerPanel?: boolean;
    headerImage?: string;
}) {
    const isActive = activePanel === index;
    const isPlayerActive = activePanel === 3;

    // Dynamic flex values based on state
    // If Player is active (index 3), it takes flex-[15] (dominant), others take flex-[1] (visible strip)
    // If Normal panel is active, it takes flex-[5], others take flex-[0.5]
    let flexClass = 'flex-[0.5]';
    if (isActive) {
        flexClass = isPlayerPanel ? 'flex-[15]' : 'flex-[5]';
    } else {
        // If another panel is active, check if it's the player panel
        flexClass = isPlayerActive ? 'flex-[1]' : 'flex-[0.5]';
    }

    return (
        <div
            onClick={!disabled ? onClick : undefined}
            className={`
                relative h-full transition-[flex] duration-700 ease-in-out overflow-hidden border-r border-border-subtle
                ${flexClass}
                ${isActive ? 'cursor-default' : 'cursor-pointer hover:bg-bg-tertiary'}
                ${disabled ? 'opacity-30 cursor-not-allowed hover:bg-transparent' : ''}
            `}
        >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-bg-secondary/20 to-bg-primary/20 -z-10" />

            {/* Active Content */}
            <div className={`
                h-full w-full transition-opacity duration-500 delay-200
                ${isActive ? 'opacity-100 visible' : 'opacity-0 invisible absolute top-0 left-0'}
            `}>
                <div className="h-full flex flex-col">
                    {/* Header - Hide in Player Panel to maximize space? Or keep small? Keeping for consistency but maybe smaller padding */}
                    <div className={`
                        border-b border-border-subtle flex items-center justify-between relative overflow-hidden
                        ${isPlayerPanel ? 'p-2' : 'p-8'}
                    `}>
                        {/* Header Image Background */}
                        {headerImage && (
                            <>
                                <div
                                    className="absolute inset-0 bg-cover bg-center opacity-50"
                                    style={{ backgroundImage: `url('${headerImage}')` }}
                                />
                                <div className="absolute inset-0 bg-black/40" /> {/* Overlay for text readability */}
                            </>
                        )}

                        <div className="relative z-10 flex items-center justify-between w-full">
                            <h2 className={`font-bold tracking-tighter ${isPlayerPanel ? 'text-sm' : 'text-3xl'}`}>{title}</h2>
                            <div className="text-text-muted">{isPlayerPanel ? <Minimize2 className="w-4 h-4" /> : icon}</div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden relative">
                        {children}
                    </div>
                </div>
            </div>

            {/* Inactive Vertical Label */}
            <div className={`
                absolute inset-0 flex items-center justify-center transition-opacity duration-300
                ${isActive ? 'opacity-0 invisible' : 'opacity-100 visible'}
            `}>

                <div className="rotate-180 relative z-10" style={{ writingMode: 'vertical-rl' }}>
                    <span className="text-xl font-bold tracking-widest uppercase text-text-muted whitespace-nowrap flex items-center gap-4">
                        {title}
                        <span className="rotate-90">{icon}</span>
                    </span>
                </div>
            </div>
        </div>
    );
}
