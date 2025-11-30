import { useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { Play, Pause, SkipBack, SkipForward, Repeat, Volume2, VolumeX, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import { formatTime } from '@/lib/utils/formatters';

interface AudioPlayerProps {
    audioUrl: string;
    songTitle: string;
    mode: 'backtrack' | 'cover';
    isMinimized?: boolean;
    onMinimizedChange?: (minimized: boolean) => void;
}

export const AudioPlayer = ({
    audioUrl,
    songTitle,
    mode,
    isMinimized = false,
    onMinimizedChange
}: AudioPlayerProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [seek, setSeek] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [rate, setRate] = useState(1.0);
    const soundRef = useRef<Howl | null>(null);
    const requestRef = useRef<number>(null);

    useEffect(() => {
        soundRef.current = new Howl({
            src: [audioUrl],
            html5: true, // Force HTML5 Audio for streaming/large files
            volume: volume,
            rate: rate,
            onload: () => {
                setDuration(soundRef.current?.duration() || 0);
            },
            onend: () => {
                setIsPlaying(false);
            },
            onplay: () => {
                setIsPlaying(true);
                requestRef.current = requestAnimationFrame(updateSeek);
            },
            onpause: () => {
                setIsPlaying(false);
                cancelAnimationFrame(requestRef.current!);
            },
            onstop: () => {
                setIsPlaying(false);
                setSeek(0);
                cancelAnimationFrame(requestRef.current!);
            }
        });

        return () => {
            soundRef.current?.unload();
            cancelAnimationFrame(requestRef.current!);
        };
    }, [audioUrl]);

    useEffect(() => {
        if (soundRef.current) {
            soundRef.current.volume(volume);
        }
    }, [volume]);

    useEffect(() => {
        if (soundRef.current) {
            soundRef.current.rate(rate);
        }
    }, [rate]);

    const updateSeek = () => {
        if (soundRef.current && soundRef.current.playing()) {
            setSeek(soundRef.current.seek());
            requestRef.current = requestAnimationFrame(updateSeek);
        }
    };

    const togglePlay = () => {
        if (!soundRef.current) return;
        if (isPlaying) {
            soundRef.current.pause();
        } else {
            soundRef.current.play();
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSeek = parseFloat(e.target.value);
        setSeek(newSeek);
        soundRef.current?.seek(newSeek);
    };

    const skip = (seconds: number) => {
        if (!soundRef.current) return;
        const current = soundRef.current.seek();
        soundRef.current.seek(Math.max(0, Math.min(duration, current + seconds)));
        setSeek(soundRef.current.seek());
    };

    if (isMinimized) {
        return (
            <div className="flex items-center gap-4 bg-bg-elevated border border-border-default rounded-full px-4 py-2 shadow-xl">
                <Button variant="ghost" size="sm" onClick={togglePlay} className="rounded-full w-8 h-8 p-0">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <div className="flex flex-col">
                    <span className="text-xs font-bold truncate max-w-[150px]">{songTitle}</span>
                    <span className="text-[10px] text-text-muted font-mono">
                        {formatTime(seek)} / {formatTime(duration)}
                    </span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onMinimizedChange?.(false)} className="rounded-full w-8 h-8 p-0">
                    <Maximize2 className="w-4 h-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-bg-elevated border border-border-default rounded-lg p-4 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-text-primary">{songTitle}</h3>
                    <p className="text-xs text-text-secondary uppercase tracking-wider">{mode}</p>
                </div>
                {onMinimizedChange && (
                    <Button variant="ghost" size="sm" onClick={() => onMinimizedChange(true)}>
                        <Minimize2 className="w-4 h-4" />
                    </Button>
                )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
                <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={seek}
                    onChange={handleSeek}
                    className="w-full h-1 bg-bg-tertiary rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-500"
                />
                <div className="flex justify-between text-xs text-text-muted font-mono">
                    <span>{formatTime(seek)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => skip(-5)}>
                    <SkipBack className="w-5 h-5" />
                </Button>

                <Button
                    variant="primary"
                    size="lg"
                    onClick={togglePlay}
                    className="rounded-full w-12 h-12 p-0"
                >
                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                </Button>

                <Button variant="ghost" size="sm" onClick={() => skip(5)}>
                    <SkipForward className="w-5 h-5" />
                </Button>
            </div>

            {/* Volume & Rate */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1">
                    <Volume2 className="w-4 h-4 text-text-muted" />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-20 h-1 bg-bg-tertiary rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-text-secondary"
                    />
                </div>

                <select
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                    className="bg-bg-tertiary border border-border-default rounded text-xs px-2 py-1 text-text-secondary focus:outline-none"
                >
                    <option value="0.5">0.5x</option>
                    <option value="0.75">0.75x</option>
                    <option value="1.0">1.0x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                </select>
            </div>
        </div>
    );
};
