import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
        const variants = {
            // Elegant cream primary
            primary: cn(
                'bg-cream-primary text-bg-primary font-medium',
                'hover:bg-cream-dark hover:shadow-elevated',
                'active:scale-[0.98]',
                'border border-cream-dark/20',
                'transition-all duration-200'
            ),
            // Sophisticated secondary with subtle glow
            secondary: cn(
                'bg-bg-elevated text-text-primary font-medium',
                'border border-border-default',
                'hover:border-gold-primary/50 hover:bg-bg-tertiary hover:shadow-glow-sm',
                'active:scale-[0.98]',
                'transition-all duration-300'
            ),
            // Minimal ghost
            ghost: cn(
                'bg-transparent text-text-secondary',
                'hover:bg-bg-elevated hover:text-text-primary',
                'active:scale-[0.98]',
                'transition-all duration-200'
            ),
            // Danger with vermillion
            danger: cn(
                'bg-vermillion-primary/10 text-vermillion-light font-medium',
                'border border-vermillion-primary/20',
                'hover:bg-vermillion-primary/20 hover:border-vermillion-primary/40',
                'active:scale-[0.98]',
                'transition-all duration-200'
            ),
            // Signature gold with glow
            gold: cn(
                'bg-gradient-to-r from-gold-dark via-gold-primary to-gold-light',
                'text-bg-primary font-semibold',
                'hover:shadow-glow hover:scale-[1.02]',
                'active:scale-[0.98]',
                'border border-gold-light/30',
                'transition-all duration-300',
                'relative overflow-hidden',
                // Shimmer effect
                'before:absolute before:inset-0',
                'before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
                'before:translate-x-[-200%]',
                'hover:before:translate-x-[200%]',
                'before:transition-transform before:duration-700'
            ),
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm rounded-md',
            md: 'px-5 py-2.5 text-base rounded-lg',
            lg: 'px-7 py-3.5 text-lg rounded-xl',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center',
                    'font-sans tracking-tight',
                    'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary',
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
