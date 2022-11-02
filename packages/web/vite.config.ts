import preact from '@preact/preset-vite';
import dns from 'dns';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadEnv, defineConfig, UserConfigExport } from 'vite';
import svgr from 'vite-plugin-svgr';

dns.setDefaultResultOrder('verbatim');

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };

  const config: UserConfigExport = {
    server: {
      port: 3000,
      strictPort: true,
    },
    ssr: {
      external: ['react', 'preact', 'react-dom'],
      noExternal: true,
    },
    plugins: [
      preact(),
      svgr({
        exportAsDefault: true,
      }),
    ],
    resolve: {
      alias: {
        src: path.resolve(__dirname, 'src'),
        react: 'preact/compat',
        'react-dom': 'preact/compat',
        'react/jsx-runtime': 'preact/jsx-runtime',
      },
    },
    build: {
      commonjsOptions: {
        requireReturnsDefault: true,
      },
    },
  };

  return config;
});
