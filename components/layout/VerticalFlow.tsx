"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { Music2, Mic2, PlayCircle, Layers, Maximize2, Minimize2, GripVertical } from "lucide-react";
import SongCard from "@/components/ui/SongCard";
import PdfViewer from "@/components/ui/PdfViewer";

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
}

interface VerticalFlowProps {
    songs: Song[];
}

type PanelId = 0 | 1 | 2 | 3;

export default function VerticalFlow({ songs }: VerticalFlowProps) {
    const [activePanel, setActivePanel] = useState<PanelId>(0);
    const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);
    const [selectedMode, setSelectedMode] = useState<"backtrack" | "cover" | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
    const [scrollSpeed, setScrollSpeed] = useState(0.5);

    // Player Resizing State (Width of the Player section)
    const [playerWidth, setPlayerWidth] = useState(400); // Initial width in px
    const isResizing = useRef(false);

    // Filter songs based on selected level
    const filteredSongs = selectedLevel
        ? songs.filter(s => s.base_difficulty === selectedLevel)
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

    const handleModeSelect = (mode: "backtrack" | "cover") => {
        setSelectedMode(mode);
        setActivePanel(3); // Move to Player
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
        <div className="flex w-full h-[calc(100vh-4rem)] overflow-hidden bg-bg-primary">

            {/* PANEL 1: LEVEL SELECTION */}
            <Panel
                index={0}
                activePanel={activePanel}
                onClick={() => setActivePanel(0)}
                title="DIFFICULTY"
                icon={<Layers className="w-6 h-6" />}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-8 max-w-4xl mx-auto w-full">
                    {[1, 2, 3, 4].map((level) => (
                        <button
                            key={level}
                            onClick={(e) => { e.stopPropagation(); handleLevelSelect(level); }}
                            className={`
                group relative flex flex-col items-center justify-center h-48 border border-border-subtle 
                hover:border-text-primary transition-all duration-300 bg-bg-secondary/50 backdrop-blur-sm
                ${selectedLevel === level ? 'border-text-primary bg-bg-secondary' : ''}
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
            >
                <div className="h-full overflow-y-auto p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                        {filteredSongs.map(song => (
                            <div key={song.id} onClick={(e) => { e.stopPropagation(); handleSongSelect(song); }} className="cursor-pointer">
                                <SongCard song={song} />
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
            >
                <div className="flex flex-col md:flex-row gap-8 items-center justify-center h-full p-8">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleModeSelect("backtrack"); }}
                        className="w-full md:w-1/3 aspect-square border border-border-subtle hover:border-text-primary bg-bg-secondary flex flex-col items-center justify-center gap-4 transition-all group"
                    >
                        <Music2 className="w-12 h-12 text-text-muted group-hover:text-text-primary" />
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-text-primary">PRACTICE</h3>
                            <p className="text-sm text-text-secondary font-mono mt-1">Backtrack Only</p>
                        </div>
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); handleModeSelect("cover"); }}
                        className="w-full md:w-1/3 aspect-square border border-border-subtle hover:border-text-primary bg-bg-secondary flex flex-col items-center justify-center gap-4 transition-all group"
                    >
                        <PlayCircle className="w-12 h-12 text-text-muted group-hover:text-text-primary" />
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-text-primary">LISTEN</h3>
                            <p className="text-sm text-text-secondary font-mono mt-1">Full Cover</p>
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
            >
                <div className="flex h-full w-full relative">
                    {/* Sheet Music Area (Left - Takes remaining space) */}
                    <div className="flex-1 bg-bg-secondary/50 relative overflow-hidden flex flex-col">
                        {selectedSong?.pdf_url ? (
                            <div className="w-full h-full">
                                <PdfViewer
                                    url={selectedSong.pdf_url}
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
                        <div className="flex-1 flex items-center justify-center p-8">
                            <div className="text-center space-y-6 w-full">
                                <div className={`
                                    w-32 h-32 rounded-full border-2 flex items-center justify-center mx-auto transition-all duration-500
                                    ${isPlaying ? 'border-text-primary animate-pulse shadow-[0_0_30px_rgba(255,255,255,0.2)]' : 'border-border-subtle'}
                                `}>
                                    {isPlaying ? (
                                        <div className="flex gap-2">
                                            <div className="w-3 h-12 bg-text-primary rounded-full" />
                                            <div className="w-3 h-12 bg-text-primary rounded-full" />
                                        </div>
                                    ) : (
                                        <PlayCircle className="w-16 h-16 text-text-primary" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold tracking-widest">
                                        {isPlaying ? "PLAYING" : "PLAYER READY"}
                                    </h2>
                                    <p className="font-mono text-sm text-text-secondary mt-2">
                                        {selectedSong?.title}
                                    </p>
                                    <span className="inline-block mt-2 px-2 py-1 border border-border-subtle text-xs font-mono text-text-muted uppercase">
                                        {selectedMode} MODE
                                    </span>
                                </div>

                                {/* Placeholder Controls */}
                                <div className="flex justify-center gap-8 pt-8">
                                    <div className="w-12 h-12 rounded-full border border-border-subtle flex items-center justify-center hover:bg-bg-tertiary cursor-pointer">
                                        <span className="text-xs font-mono">RST</span>
                                    </div>
                                    <div
                                        onClick={togglePlay}
                                        className="w-16 h-16 rounded-full bg-text-primary text-bg-primary flex items-center justify-center hover:opacity-90 cursor-pointer transition-transform active:scale-95"
                                    >
                                        {isPlaying ? (
                                            <div className="flex gap-1">
                                                <div className="w-2 h-6 bg-bg-primary rounded-full" />
                                                <div className="w-2 h-6 bg-bg-primary rounded-full" />
                                            </div>
                                        ) : (
                                            <PlayCircle className="w-8 h-8 fill-current" />
                                        )}
                                    </div>
                                    <div className="w-12 h-12 rounded-full border border-border-subtle flex items-center justify-center hover:bg-bg-tertiary cursor-pointer">
                                        <span className="text-xs font-mono">LOOP</span>
                                    </div>
                                </div>

                                {/* Auto-scroll Controls */}
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
            </Panel>

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
    isPlayerPanel = false
}: {
    index: number;
    activePanel: number;
    onClick: () => void;
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    disabled?: boolean;
    isPlayerPanel?: boolean;
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
            <div className="absolute inset-0 bg-gradient-to-b from-bg-secondary to-bg-primary -z-10" />

            {/* Active Content */}
            <div className={`
                h-full w-full transition-opacity duration-500 delay-200
                ${isActive ? 'opacity-100 visible' : 'opacity-0 invisible absolute top-0 left-0'}
            `}>
                <div className="h-full flex flex-col">
                    {/* Header - Hide in Player Panel to maximize space? Or keep small? Keeping for consistency but maybe smaller padding */}
                    <div className={`
                        border-b border-border-subtle flex items-center justify-between
                        ${isPlayerPanel ? 'p-2' : 'p-8'}
                    `}>
                        <h2 className={`font-bold tracking-tighter ${isPlayerPanel ? 'text-sm' : 'text-3xl'}`}>{title}</h2>
                        <div className="text-text-muted">{isPlayerPanel ? <Minimize2 className="w-4 h-4" /> : icon}</div>
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
                <div className="rotate-180" style={{ writingMode: 'vertical-rl' }}>
                    <span className="text-xl font-bold tracking-widest uppercase text-text-muted whitespace-nowrap flex items-center gap-4">
                        {title}
                        <span className="rotate-90">{icon}</span>
                    </span>
                </div>
            </div>
        </div>
    );
}
