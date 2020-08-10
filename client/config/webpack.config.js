const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const Dotenv = require('dotenv-webpack');

const BUILD_PATH = path.resolve(__dirname, '../build');
const IMAGE_PATH = path.resolve(__dirname, '../build/images');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    background: './src/background/index.ts',
    app: './src/app/index.tsx',
    contentScript: './src/contentscript/index.ts',
    bridge: './src/bridge/index.ts'
  },
  output: {
    path: BUILD_PATH,
    filename: '[name].js'
  },
  resolve: {
    extensions: [ '.ts', '.tsx', '.js', '.jsx', '.scss' ],
    modules: [ 'src', 'node_modules' ]
  },
  plugins: [
    new Dotenv(),
    new CopyPlugin({
      patterns: [
        { from: path.resolve(__dirname, './manifest.json'), to: BUILD_PATH },
        { from: path.resolve(__dirname, '../images'), to: IMAGE_PATH }
      ]
    }),
    new HtmlWebpackPlugin({
      template: './src/app/index.html',
      filename: 'app.html',
      inject: false
    }),
    new CleanWebpackPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.module\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[local]--[hash:base64:10]'
              }
            }
          },
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass')
            }
          }
        ]
      },
      {
        test: /\.(s?)css$/,
        exclude: /\.module.(scss)$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass')
            }
          }
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader'
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          'file-loader'
        ]
      },
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  }
};
