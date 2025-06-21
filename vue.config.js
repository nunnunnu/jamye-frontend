const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})

module.exports = {
    filenameHashing: false,
    pages: {
      index: {
        entry: 'src/main.js',
        title: '잼얘가챠',
      }
    }
};
