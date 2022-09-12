/// <reference types="vitest" />

import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import { defineConfig, loadEnv, UserConfig } from 'vite';
import graphql from '@rollup/plugin-graphql';
import handlebars from 'vite-plugin-handlebars';
import vue from '@vitejs/plugin-vue';
import { version } from './package.json';

export default defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, __dirname, 'VITE_');

  process.env.VITE_APP_VERSION = version || '0.0.0';

  let https: boolean | Object = true;
  if (existsSync('./localhost.key') && existsSync('./localhost.crt')) {
    https = {
      key: readFileSync('./localhost.key'),
      cert: readFileSync('./localhost.crt'),
    };
  }

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
          register: resolve(__dirname, 'src/register/index.html'),
          admin: resolve(__dirname, 'src/admin/index.html'),
        },
      },
    },
    test: {},
    optimizeDeps: {
      include: ['@apollo/client/core'],
      exclude: ['@apollo/client'],
    },
    server: {
      https,
      port: 8443,
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
