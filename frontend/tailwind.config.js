/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                /* ── SOC Cyber Palette ────────────────── */
                cyber: {
                    50: '#d8ffe7',
                    100: '#a8ffc8',
                    200: '#6bffa0',
                    300: '#33ff80',
                    400: '#00ff9f',
                    500: '#00e68a',
                    600: '#00cc7a',
                    700: '#009960',
                    800: '#006640',
                    900: '#003320',
                },
                /* ── Dark Panels ──────────────────────── */
                soc: {
                    950: '#050805',
                    900: '#0a0f0a',
                    850: '#0d130d',
                    800: '#0f1a0f',
                    750: '#121f12',
                    700: '#1a2d1a',
                    600: '#1f3f1f',
                    500: '#2a5a2a',
                    400: '#3a7a3a',
                    300: '#5a9a5a',
                },
                /* ── Accent Colors ────────────────────── */
                threat: {
                    critical: '#ff1744',
                    high: '#ff6d00',
                    medium: '#ffd600',
                    low: '#00e676',
                    info: '#00b0ff',
                },
            },
            fontFamily: {
                mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'cyber': '0 0 10px rgba(0, 255, 159, 0.15)',
                'cyber-lg': '0 0 20px rgba(0, 255, 159, 0.2)',
                'cyber-glow': '0 0 30px rgba(0, 255, 159, 0.3), 0 0 60px rgba(0, 255, 159, 0.1)',
                'threat': '0 0 15px rgba(255, 23, 68, 0.3)',
            },
            animation: {
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
                'scan': 'scan 4s linear infinite',
                'flicker': 'flicker 0.15s ease-in-out',
                'slide-in': 'slideIn 0.2s ease-out',
                'fade-in': 'fadeIn 0.25s ease-out',
                'terminal': 'termBlink 1s step-end infinite',
            },
            keyframes: {
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 4px rgba(0, 255, 159, 0.3)' },
                    '50%': { boxShadow: '0 0 16px rgba(0, 255, 159, 0.6)' },
                },
                scan: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100vh)' },
                },
                flicker: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.8' },
                },
                slideIn: {
                    from: { opacity: '0', transform: 'translateX(8px)' },
                    to: { opacity: '1', transform: 'translateX(0)' },
                },
                fadeIn: {
                    from: { opacity: '0', transform: 'translateY(4px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                termBlink: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0' },
                },
            },
        },
    },
    plugins: [],
};
