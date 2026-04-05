/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: { DEFAULT: '#2563EB', hover: '#1d4ed8', light: '#EFF6FF' },
                accent: '#3B82F6',
            },
            fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui'] },
        },
    },
    plugins: [],
};
