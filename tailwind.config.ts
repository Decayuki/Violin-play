import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Backgrounds
                bg: {
                    primary: '#000000',      // True Black
                    secondary: '#050505',    // Almost Black (Blocks)
                    tertiary: '#111111',     // Hover states
                    elevated: '#111111',     // Modals
                },

                // Borders
                border: {
                    subtle: '#27272a',       // Zinc 800 - Grid lines
                    default: '#3f3f46',      // Zinc 700
                    strong: '#52525b',       // Zinc 600
                },

                // Text
                text: {
                    primary: '#ffffff',      // Pure White
                    secondary: '#a1a1aa',    // Zinc 400
                    muted: '#52525b',        // Zinc 600
                    inverse: '#000000',      // Black
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
