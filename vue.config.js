module.exports = {
  productionSourceMap: false,

  pages: {
    index: {
      // entry for the page
      entry: './src/pages/index/index.ts',

      // the source template
      template: 'public/index.html',

      // when using title option,
      // template title tag needs to be <title><%= htmlWebpackPlugin.options.title %></title>
      title: 'Home',

      // chunks to include on this page, by default includes
      // extracted common chunks and vendor chunks.
      chunks: ['chunk-vendors', 'chunk-common', 'index'],
    },

    admin: {
      // entry for the page
      entry: './src/pages/admin/admin.ts',

      // the source template
      template: 'public/admin.html',

      // when using title option,
      // template title tag needs to be <title><%= htmlWebpackPlugin.options.title %></title>
      title: 'Admin',

      // chunks to include on this page, by default includes
      // extracted common chunks and vendor chunks.
      chunks: ['chunk-vendors', 'chunk-common', 'admin'],
    },
  },

  css: {
    loaderOptions: {
      sass: {
        prependData: `
          @use 'sass:map';
          @import "@/scss/_variables.scss";
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
    proxy: {
      '/graphql': {
        target: 'https://localhost:5001',
      },
    },
  },
};
