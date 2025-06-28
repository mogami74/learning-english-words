const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    index: './src/index.ts',
    qa: './src/ts/qa.ts',
    unit1: './units/unit1/unit1.ts'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      title: 'Learning English Words',
      filename: 'index.html',
      chunks: ['index']
    }),
    new HtmlWebpackPlugin({
      template: './qa.html',
      title: 'Q&A Page',
      filename: 'qa.html',
      chunks: ['qa']
    }),
    new HtmlWebpackPlugin({
      template: './units/unit1/qa.html',
      title: 'Unit 1 - 日本語→英語',
      filename: 'unit1-qa.html',
      chunks: ['unit1']
    }),
    new HtmlWebpackPlugin({
      template: './units/unit1/qq.html',
      title: 'Unit 1 - 英語→日本語',
      filename: 'unit1-qq.html',
      chunks: ['unit1']
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'units/unit1/wordlist.json',
          to: 'wordlist.json',
        },
        {
          from: 'data/wordlist.json',
          to: 'data/wordlist.json',
        },
      ],
    }),
  ],
  devServer: {
    static: './dist',
    open: true,
    hot: true,
  },
};
