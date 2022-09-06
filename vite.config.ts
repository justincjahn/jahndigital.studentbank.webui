import { resolve } from 'path';
import { defineConfig, loadEnv, UserConfig } from 'vite';

// Plugins
import handlebars from 'vite-plugin-handlebars';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }): UserConfig => {
  var env = loadEnv(mode, __dirname);

  return {
    root:'src',
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
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
    plugins: [
      vue(),
      handlebars({
        context: {
          ...env,
        },
      }) as Plugin,
    ]
  };
});
