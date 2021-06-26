process.env.VUE_APP_THEME = process.env.VUE_APP_THEME || '@/scss/_theme.scss';
process.env.VUE_APP_SITE_NAME = process.env.VUE_APP_SITE_NAME || 'Student Bank';

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
        prependData: `
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
    https: true,
    port: 8443,
    proxy: {
      '/graphql': {
        target: 'https://localhost:5001',
      },
    },
  },
};
