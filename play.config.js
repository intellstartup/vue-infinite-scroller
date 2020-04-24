module.exports = {
  entry: {
    app: 'play/app.js',
    preview: 'play/preview.js'
  },

  output: {
    dir: 'dist-play'
  },

  devServer: {
    port: 5000
  },

  pages: {
    index: {
      chunks: ['app'],
      entry: 'play/app.js',
      filename: 'index.html'
    },
    preview: {
      chunks: ['preview'],
      entry: 'play/preview.js',
      filename: 'preview.html'
    }
  },

  chainWebpack: config => {
    // prettier-ignore
    config.module
      .rule('ts')
      .test(/\.ts$/)
      .use('ts-loader')
        .loader('ts-loader')
        .options({
          appendTsSuffixTo: [/\.vue$/]
        })

    config.optimization.splitChunks(false)

    config.resolve.alias.set('vue$', 'vue/dist/vue.esm.js')
  }
}
