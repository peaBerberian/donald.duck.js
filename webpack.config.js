const webpack = require("webpack");

module.exports = {
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },

  context: __dirname + '/src',
  entry: './index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'morora.min.js'
  },

  plugins: [
    new webpack.optimize.UglifyJsPlugin({ minimize: true })
  ]
};
