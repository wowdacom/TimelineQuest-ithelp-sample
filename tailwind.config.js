/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                Libre: ['Libre Franklin', 'sans-serif'],
            },
            boxShadow: {
                bottom: ' 0px 6px 0px 0px #b1aea4',
            },
            keyframes: {
                wiggle: {
                    '10%': { transform: 'scale(1)', opacity: 1 },
                    '20%': { transform: 'scale(0.9)', opacity: 1 },
                    '80%': { transform: 'scale(0.9) translateY(15px)', opacity: 1 },
                    '90%': { opacity: 1 },
                },
                wiggleCard: {
                    '0%': { transform: 'translate(-50%,5px)' },
                    '20%': { transform: 'translate(-50%,5px)' },
                    '80%': { transform: 'translate(-50%,15px)' },
                },
            },
        },
    },
    plugins: [],
};
