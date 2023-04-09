/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,svelte}'],
    theme: {
        extend: {
            colors: {
                primary: '#f3ec78',
                secondary: '#c16f67',
                tertiary: '#af4261',
            },
            // Add a gradient color
            gradientColorStops: {
                'gradient-primary': '#800080, #ff00ff',
            },
        },
    },
    plugins: [],
}