/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
    extend: {
      colors: {
        default: '#f1f1f1',
        paper: '#f5f5f5',
        offset: '#778DA9',
        primary: '#316466',
        secondary: '#381D2A',
      },
      screens: {
        smo: { max: '639px' },
        lgo: { max: '1023px' },
      },
    },
  },
	plugins: [],
}
