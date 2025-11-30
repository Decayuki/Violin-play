import { useState } from 'react';
import { StarRating } from '@/components/ui/StarRating';
import { Button } from '@/components/ui/Button';
import { RotateCcw } from 'lucide-react';

interface DifficultyOverrideProps {
    songId: string;
    baseDifficulty: number;
    userDifficulty: number | null;
    onUpdate: (difficulty: number | null) => void;
}

export const DifficultyOverride = ({
    songId,
    baseDifficulty,
    userDifficulty,
    onUpdate
}: DifficultyOverrideProps) => {
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (value: number | null) => {
        setLoading(true);
        try {
            const response = await fetch('/api/user-difficulty', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ songId, difficulty: value }),
            });

            if (response.ok) {
                onUpdate(value);
            }
        } catch (error) {
            console.error('Failed to update difficulty', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-bg-secondary border border-border-subtle rounded-lg p-4 space-y-4">
            <h4 className="text-sm font-medium text-text-secondary">Difficulty Settings</h4>

            <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Base Difficulty:</span>
                <StarRating value={baseDifficulty} readonly size="sm" />
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-text-primary">Your Difficulty:</span>
                    {userDifficulty !== null && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdate(null)}
                            disabled={loading}
                            className="h-6 px-2 text-xs"
                        >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Reset
                        </Button>
                    )}
                </div>

                <div className="flex justify-center p-2 bg-bg-tertiary rounded-md">
                    <StarRating
                        value={userDifficulty ?? baseDifficulty}
                        onChange={(val) => handleUpdate(val)}
                        size="lg"
                    />
                </div>
            </div>
        </div>
    );
};
