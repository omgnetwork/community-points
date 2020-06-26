const merge = require('webpack-merge');
const commonConfig = require('./webpack.config.js');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = merge(commonConfig, {
  mode: 'production',
  plugins: [
    new CleanWebpackPlugin()
  ]
});
