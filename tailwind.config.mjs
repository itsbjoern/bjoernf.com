/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
    extend: {
      colors: {
        default: '#ffffff',
        paper: '#ffffff',
        primary: '#1c1c1c',
        muted: '#6b6b6b',
        accent: '#c2410c',
      },
      screens: {
        smo: { max: '639px' },
        lgo: { max: '1023px' },
      },
    },
  },
	plugins: [],
}
