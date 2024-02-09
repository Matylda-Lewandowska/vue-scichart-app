const { defineConfig } = require('@vue/cli-service');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = defineConfig({
  transpileDependencies: true,

  configureWebpack: {
    plugins: [
      new CopyPlugin({
        patterns: [
          // Copy *.data files to /public
          {
            from: path.resolve(__dirname, 'node_modules/scichart/_wasm/*.data'),
            to: path.resolve(__dirname, 'public/[name][ext]'),
            noErrorOnMissing: true,
          },
          // Copy *.wasm files to /public/js
          {
            from: path.resolve(__dirname, 'node_modules/scichart/_wasm/*.wasm'),
            to: path.resolve(__dirname, 'public/js/[name][ext]'),
            noErrorOnMissing: true,
          },
        ],
      }),
    ],
  },
});
