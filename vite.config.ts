import { resolve } from 'path';
import { defineConfig, loadEnv, UserConfig } from 'vite';

// Plugins
import graphql from '@rollup/plugin-graphql';
import handlebars from 'vite-plugin-handlebars';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, __dirname, 'VITE_');

  return {
    root: 'src',
    envDir: __dirname,
    resolve: {
      alias: {
        '@/': `${resolve(__dirname, 'src')}/`,
      },
    },
    build: {
      outDir: resolve(__dirname, 'dist'),
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/index.html'),
          registration: resolve(__dirname, 'src/registration/index.html'),
          admin: resolve(__dirname, 'src/admin/index.html'),
        },
      },
    },
    optimizeDeps: {
      include: ['@apollo/client/core'],
      exclude: ['@apollo/client'],
    },
    plugins: [
      vue(),
      graphql(),
      handlebars({
        context: {
          ...env,
        },
      }) as Plugin,
    ],
  };
});
