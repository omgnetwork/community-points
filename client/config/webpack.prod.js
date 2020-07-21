const path = require('path');
const merge = require('webpack-merge');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');
const commonConfig = require('./webpack.config.js');

const BUILD_PATH = path.resolve(__dirname, '../build');

module.exports = merge(commonConfig, {
  mode: 'production',
  plugins: [
    new SentryWebpackPlugin({
      include: BUILD_PATH
    })
  ]
});
