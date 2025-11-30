import { Button } from '@/components/ui/Button';
import { Song } from '@/types';
import { Headphones, Music, Play } from 'lucide-react';

interface AccompanimentSelectorProps {
    song: Song;
    selectedMode: 'backtrack' | 'cover' | null;
    onSelect: (mode: 'backtrack' | 'cover') => void;
    onStartPractice: () => void;
}

export const AccompanimentSelector = ({
    song,
    selectedMode,
    onSelect,
    onStartPractice
}: AccompanimentSelectorProps) => {
    return (
        <div className="flex flex-col gap-4 p-4 bg-bg-elevated border border-border-default rounded-lg animate-in fade-in slide-in-from-bottom-4">
            <h4 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
                Select Accompaniment
            </h4>

            <div className="grid grid-cols-2 gap-4">
                <Button
                    variant={selectedMode === 'backtrack' ? 'primary' : 'secondary'}
                    onClick={() => onSelect('backtrack')}
                    disabled={!song.backtrack_url}
                    className="h-auto py-4 flex flex-col gap-2"
                >
                    <Headphones className="w-6 h-6" />
                    <span>Backtrack</span>
                    {!song.backtrack_url && <span className="text-xs opacity-50">(Not available)</span>}
                </Button>

                <Button
                    variant={selectedMode === 'cover' ? 'primary' : 'secondary'}
                    onClick={() => onSelect('cover')}
                    disabled={!song.cover_url} // Assuming cover_url is used for cover audio? Or maybe same field? Spec says cover_url.
                    className="h-auto py-4 flex flex-col gap-2"
                >
                    <Music className="w-6 h-6" />
                    <span>Cover</span>
                    {!song.cover_url && <span className="text-xs opacity-50">(Not available)</span>}
                </Button>
            </div>

            {selectedMode && (
                <Button
                    size="lg"
                    className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white shadow-green-900/20"
                    onClick={onStartPractice}
                >
                    <Play className="w-5 h-5 mr-2 fill-current" />
                    START PRACTICE
                </Button>
            )}
        </div>
    );
};
