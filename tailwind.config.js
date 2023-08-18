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
                    '10%': { transform: 'scale(1) rotate(-45deg)', opacity: 1 },
                    '20%': { transform: 'scale(0.9) rotate(-45deg)', opacity: 1 },
                    '80%': { transform: 'scale(0.9) translateY(15px) rotate(-45deg)', opacity: 1 },
                    '90%': { transform: 'rotate(-45deg)', opacity: 1 },
                },
            },
        },
    },
    plugins: [],
};
