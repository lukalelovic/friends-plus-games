/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,svelte}'],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#fdf7f7',
                    100: '#fdeeee',
                    // ... and so on
                    900: '#3e0c3e',
                },
                secondary: {
                    50: '#faf9f9',
                    100: '#f5f5f5',
                    // ... and so on
                    900: '#3c3c3c',
                },
                tertiary: {
                    50: '#fdfafa',
                    100: '#faf4f4',
                    // ... and so on
                    900: '#2c2c2c',
                },
            },
            // Add a gradient color
            gradientColorStops: {
                'gradient-primary': '#800080, #ff00ff',
            },
        },
    },
    plugins: [],
}