import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                border: {
                    DEFAULT: "hsl(var(--border))",
                    subtle: '#1a1a1a',
                    default: '#2a2a2a',
                    strong: '#3a3a3a',
                },
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",

                // Enhanced Concert Hall Palette
                bg: {
                    primary: '#050505',     // Deep black (stage darkness)
                    secondary: '#0f0f0f',   // Rich black
                    tertiary: '#1a1a1a',    // Elevated black
                    elevated: '#242424',    // Hover states
                },
                text: {
                    primary: '#FAFAF9',     // Warm white (sheet music)
                    secondary: '#A8A29E',   // Stone 400 (muted)
                    muted: '#57534E',       // Stone 600
                    inverse: '#000000',
                },

                // Signature Gold (refined)
                gold: {
                    primary: '#D4AF37',     // Classic gold
                    light: '#F4D03F',       // Bright gold
                    dark: '#B8860B',        // Dark goldenrod
                    subtle: 'rgba(212, 175, 55, 0.08)',
                    glow: 'rgba(212, 175, 55, 0.25)',
                },

                // NEW: Bordeaux accent (concert hall velvet)
                bordeaux: {
                    primary: '#6B1932',     // Deep bordeaux
                    light: '#8B2444',       // Light bordeaux
                    dark: '#4A1022',        // Dark bordeaux
                    subtle: 'rgba(107, 25, 50, 0.1)',
                },

                // NEW: Cream accent (warm highlight)
                cream: {
                    primary: '#F5F0E8',     // Soft cream
                    dark: '#E8DCC8',        // Darker cream
                    subtle: 'rgba(245, 240, 232, 0.05)',
                },

                // NEW: Vermillion accent (passion, energy)
                vermillion: {
                    primary: '#D84315',     // Deep orange-red
                    light: '#FF6F3C',       // Bright vermillion
                    dark: '#BF360C',        // Dark vermillion
                },

                // Semantic (updated)
                success: '#059669',         // Emerald 600
                warning: '#D97706',         // Amber 600
                error: '#DC2626',           // Red 600
                info: '#2563EB',            // Blue 600

                // Difficulty colors (updated with warmth)
                difficulty: {
                    1: '#78716C',  // Stone 500
                    2: '#A8A29E',  // Stone 400
                    3: '#D6D3D1',  // Stone 300
                    4: '#E7E5E4',  // Stone 200
                },
            },

            fontFamily: {
                // Distinctive typography
                display: ['Playfair Display', 'Georgia', 'serif'],  // Elegant display
                sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'], // Clean body
                mono: ['IBM Plex Mono', 'monospace'],               // Technical precision
            },

            fontSize: {
                // Refined scale
                'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
                'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
                'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
                'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
                'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.015em' }],
                '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }],
                '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.03em' }],
                '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.035em' }],
                '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
            },

            borderRadius: {
                'none': '0px',
                'sm': '0.25rem',        // 4px
                'DEFAULT': '0.5rem',    // 8px
                'md': '0.5rem',         // 8px
                'lg': '0.75rem',        // 12px
                'xl': '1rem',           // 16px
                '2xl': '1.5rem',        // 24px
                'full': '9999px',
            },

            boxShadow: {
                // Dramatic shadows for depth
                'glow-sm': '0 0 10px rgba(212, 175, 55, 0.15)',
                'glow': '0 0 20px rgba(212, 175, 55, 0.25)',
                'glow-lg': '0 0 40px rgba(212, 175, 55, 0.35)',
                'elevated': '0 10px 40px -10px rgba(0, 0, 0, 0.5)',
                'elevated-lg': '0 20px 60px -15px rgba(0, 0, 0, 0.6)',
                'inner-glow': 'inset 0 0 20px rgba(212, 175, 55, 0.1)',
            },

            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-in': 'slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                'glow': 'glow 2s ease-in-out infinite',
                'shimmer': 'shimmer 2.5s linear infinite',
            },

            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideIn: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                glow: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)' },
                    '50%': { boxShadow: '0 0 30px rgba(212, 175, 55, 0.4)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% center' },
                    '100%': { backgroundPosition: '200% center' },
                },
            },
        },
    },
    plugins: [],
};
export default config;
