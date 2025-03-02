/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
    extend: {
      colors: {
        default: '#e9e9e9',
        paper: '#f5f5f5',
        primary: '#2a2a2a',
      },
      screens: {
        smo: { max: '639px' },
        lgo: { max: '1023px' },
      },
    },
  },
	plugins: [],
}
