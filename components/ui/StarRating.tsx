"use client";

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface StarRatingProps {
    value: number;
    onChange?: (value: number) => void;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

const DIFFICULTY_LABELS: Record<number, string> = {
    1: 'Easy',
    2: 'Intermediate',
    3: 'Difficult',
    4: 'Advanced',
};

const DIFFICULTY_COLORS: Record<number, string> = {
    1: 'text-green-500',
    2: 'text-blue-500',
    3: 'text-orange-500',
    4: 'text-red-500',
};

export const StarRating = ({
    value,
    onChange,
    readonly = false,
    size = 'md',
    showLabel = false,
}: StarRatingProps) => {
    const [hoverValue, setHoverValue] = useState<number | null>(null);

    const displayValue = hoverValue ?? value;
    const maxStars = 4;

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-6 h-6',
    };

    return (
        <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
                {[...Array(maxStars)].map((_, i) => {
                    const ratingValue = i + 1;
                    const isFilled = ratingValue <= displayValue;

                    return (
                        <button
                            key={i}
                            type="button"
                            disabled={readonly}
                            className={cn(
                                'transition-transform hover:scale-110 focus:outline-none',
                                readonly && 'cursor-default hover:scale-100'
                            )}
                            onMouseEnter={() => !readonly && setHoverValue(ratingValue)}
                            onMouseLeave={() => !readonly && setHoverValue(null)}
                            onClick={() => !readonly && onChange?.(ratingValue)}
                        >
                            <Star
                                className={cn(
                                    iconSizes[size],
                                    isFilled ? 'fill-current' : 'text-gray-600',
                                    isFilled && DIFFICULTY_COLORS[displayValue]
                                )}
                            />
                        </button>
                    );
                })}
            </div>
            {showLabel && (
                <span className={cn('text-sm font-medium', DIFFICULTY_COLORS[displayValue])}>
                    {DIFFICULTY_LABELS[displayValue]}
                </span>
            )}
        </div>
    );
};
