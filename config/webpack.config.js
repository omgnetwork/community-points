const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

const BUILD_PATH = path.resolve(__dirname, '../build');
const IMG_PATH = path.resolve(BUILD_PATH, 'images');

module.exports = {
  mode: 'production',
  entry: {
    background: './src/background/index.ts',
    popup: './src/popup/index.tsx'
  },
  output: {
    path: BUILD_PATH,
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.scss'],
    modules: ['src', 'node_modules']
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: path.resolve(__dirname, './manifest.json'), to: BUILD_PATH },
        { from: path.resolve(__dirname, '../images'), to: IMG_PATH }
      ]
    }),
    new HtmlWebpackPlugin({
      template: './src/popup/index.html',
      filename: 'popup.html',
      inject: false
    }),
    new Dotenv()
  ],
  module: {
    rules: [
      {
        test: /\.md$/i,
        use: 'raw-loader',
      },
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
            loader: "ts-loader"
          }
        ]
      },
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader"
      }
    ]
  }
}
