const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    index: './src/index.ts',
    qa: './src/ts/qa.ts',
    lesson1: './lessons/lesson1/lesson.ts',
    wordlist: './src/wordlist-main.ts'
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
      chunks: ['index'],
      inject: 'body'
    }),
    new HtmlWebpackPlugin({
      template: './qa.html',
      title: 'Q&A Page',
      filename: 'qa.html',
      chunks: ['qa'],
      inject: 'body'
    }),
    new HtmlWebpackPlugin({
      template: './lessons/lesson1/lesson1-qa.html',
      title: 'レッスン1 - 日本語→英語',
      filename: 'lesson1-qa.html',
      chunks: ['lesson1'],
      inject: 'body'
    }),
    new HtmlWebpackPlugin({
      template: './lessons/lesson1/lesson1-qq.html',
      title: 'レッスン1 - 英語→日本語',
      filename: 'lesson1-qq.html',
      chunks: ['lesson1'],
      inject: 'body'
    }),
    new HtmlWebpackPlugin({
      template: './lessons/lesson1/lesson1-wordlist.html',
      title: 'レッスン1 - 単語リスト',
      filename: 'lesson1-wordlist.html',
      chunks: ['lesson1', 'wordlist'],
      inject: 'body'
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'lessons/lesson1/wordlist.json',
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
