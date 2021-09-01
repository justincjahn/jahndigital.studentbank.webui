// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

process.env.VUE_APP_THEME = process.env.VUE_APP_THEME || '@/scss/_theme.scss';
process.env.VUE_APP_SITE_NAME = process.env.VUE_APP_SITE_NAME || 'Student Bank';

// eslint-disable-next-line import/newline-after-import, @typescript-eslint/no-var-requires
const { version } = require('./package.json');
process.env.VUE_APP_VERSION = version || 'unknown';

let https = true;
if (fs.existsSync('./localhost.key') && fs.existsSync('./localhost.crt')) {
  https = {
    key: fs.readFileSync('./localhost.key'),
    cert: fs.readFileSync('./localhost.crt'),
  };
}

module.exports = {
  productionSourceMap: false,

  pages: {
    index: {
      // entry for the page
      entry: './src/modules/student/index.ts',

      // the source template
      template: 'public/index.html',

      // when using title option,
      // template title tag needs to be <title><%= htmlWebpackPlugin.options.title %></title>
      title: process.env.VUE_APP_SITE_NAME,

      // chunks to include on this page, by default includes
      // extracted common chunks and vendor chunks.
      // chunks: ['chunk-vendors', 'chunk-common', 'index'],
    },

    register: {
      entry: './src/modules/register/index.ts',
      template: 'public/index.html',
      title: `${process.env.VUE_APP_SITE_NAME} Registration`,
    },

    admin: {
      entry: './src/modules/admin/index.ts',
      template: 'public/index.html',
      title: `${process.env.VUE_APP_SITE_NAME} Admin`,
    },
  },

  css: {
    loaderOptions: {
      sass: {
        additionalData: `
          @use 'sass:map';
          @use 'sass:math';
          @import "${process.env.VUE_APP_THEME}";
          @import "@/scss/_functions.scss";
          @import "@/scss/_mixins.scss";
        `,
      },
    },
  },

  chainWebpack: (config) => {
    config.module
      .rule('graphql')
      .test(/\.(graphql|gql)$/)
      .use('graphql-tag/loader')
      .loader('graphql-tag/loader')
      .end();
  },

  configureWebpack: {
    devtool: 'source-map',
  },

  devServer: {
    https,
    host: 'localhost',
    port: 8443,
    hotOnly: false,
    proxy: {
      '/graphql': {
        target: 'https://localhost:5001',
      },
    },
  },
};
