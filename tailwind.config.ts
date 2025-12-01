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
                    subtle: '#27272a',
                    default: '#3f3f46',
                    strong: '#52525b',
                },
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",

                // Custom Palette
                bg: {
                    primary: '#0a0a0a',   // Almost black
                    secondary: '#121212', // Dark grey
                    tertiary: '#1E1E1E',  // Lighter grey
                },
                text: {
                    primary: '#FFFFFF',
                    secondary: '#A1A1AA',
                    muted: '#52525b',        // Zinc 600
                    inverse: '#000000',      // Black
                },
                gold: {
                    primary: '#D4AF37',   // Classic Gold
                    light: '#F4C430',     // Bright Gold
                    dark: '#AA6C39',      // Bronze/Dark Gold
                    subtle: 'rgba(212, 175, 55, 0.1)', // Gold tint
                },

                // Accent (White/Amber)
                accent: {
                    50: '#ffffff',
                    100: '#ffffff',
                    200: '#ffffff',
                    300: '#ffffff',
                    400: '#ffffff',
                    500: '#ffffff',          // White Primary
                    600: '#d4d4d4',
                    700: '#a3a3a3',
                    800: '#737373',
                    900: '#404040',
                },

                // Semantic
                success: '#10b981',
                warning: '#f59e0b',
                error: '#ef4444',
                info: '#3b82f6',

                // Difficulty colors (Monochrome/Technical)
                difficulty: {
                    1: '#52525b',  // Zinc 600
                    2: '#71717a',  // Zinc 500
                    3: '#a1a1aa',  // Zinc 400
                    4: '#d4d4d8',  // Zinc 300
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            borderRadius: {
                'sm': '0px',        // Brutalist
                'md': '2px',        // Minimal
                'lg': '4px',        // Slight
                'xl': '8px',        // Max
                '2xl': '12px',
                'full': '9999px',   // For circular controls
            },
        },
    },
    plugins: [],
};
export default config;
