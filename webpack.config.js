
const HtmlWebpackPlugin = require('html-webpack-plugin')
const htmlPlugin = new HtmlWebpackPlugin({
  template: './client/index.html',
  filename: 'index.html',
  inject: 'body',
})

module.exports = {
  entry: ['./client/index.js'],
  output: {
    path: './dist',
    filename: 'index.js',
  },
  module: {
    loaders: [
      {test: /\.js$/, exclude: /node_modules/, loader: 'babel'},
    ]
  },
  plugins: [htmlPlugin],
}