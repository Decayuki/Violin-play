import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'outline' | 'subtle';
    color?: 'gray' | 'blue' | 'green' | 'purple' | 'pink' | 'orange' | 'red';
    size?: 'sm' | 'md';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = 'default', color = 'gray', size = 'sm', children, ...props }, ref) => {
        const colors = {
            gray: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
            blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            green: 'bg-green-500/10 text-green-400 border-green-500/20',
            purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
            orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            red: 'bg-red-500/10 text-red-400 border-red-500/20',
        };

        const sizes = {
            sm: 'text-xs px-2 py-0.5',
            md: 'text-sm px-2.5 py-0.5',
        };

        return (
            <span
                ref={ref}
                className={cn(
                    'inline-flex items-center rounded-sm font-mono uppercase tracking-wider border',
                    colors[color],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {children}
            </span>
        );
    }
);

Badge.displayName = 'Badge';
