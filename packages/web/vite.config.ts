import preact from '@preact/preset-vite';
import dns from 'dns';
import path from 'path';
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
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
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
    optimizeDeps: {
      // We manually add a list of dependencies to be pre-bundled, in order to avoid a page reload at dev start which breaks the preact plugin
      include: ['preact/devtools', 'preact/debug', 'preact/jsx-dev-runtime', 'preact', 'preact/hooks']
    }
  };

  return config;
});
