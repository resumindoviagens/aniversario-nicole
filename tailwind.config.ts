import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {
    colors: { nicolePink: '#FF2D7A', nicoleRose: '#FFD5E5', nicoleBlue: '#112B7A', nicoleGold: '#F6B21A', nicoleCream: '#FFF8F5' },
    boxShadow: { soft: '0 24px 60px rgba(17,43,122,.18)' }
  }},
  plugins: []
};
export default config;
