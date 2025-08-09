/// <reference types="vitest" />

import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import { defineConfig, loadEnv, UserConfig } from 'vite';
import graphql from '@rollup/plugin-graphql';
import handlebars from 'vite-plugin-handlebars';
import vue from '@vitejs/plugin-vue';
import { version } from './package.json';
import type { ServerOptions } from 'node:https';

export default defineConfig(({ mode }): UserConfig => {
  if (!existsSync('./localhost.key') || !existsSync('./localhost.crt')) {
    throw new Error(
      'No SSL certificate found! `npm run certgen` or `npm run certgen:win32`.'
    );
  }

  const env = loadEnv(mode, __dirname, 'VITE_');
  process.env.VITE_APP_VERSION = version || '0.0.0';

  const https: ServerOptions = {
    key: readFileSync('./localhost.key'),
    cert: readFileSync('./localhost.crt'),
  };

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
    test: {
      cache: {
        dir: `${resolve(__dirname, 'node_modules', '.vitest')}`,
      },
    },
    optimizeDeps: {
      include: ['@apollo/client/core'],
      exclude: ['@apollo/client'],
    },
    server: {
      https: https,
      port: 8443,
    },
    preview: {
      https,
      port: 9443,
    },
    plugins: [
      vue(),
      graphql(),
      handlebars({
        context: {
          ...env,
        },
      }),
    ],
  };
});
