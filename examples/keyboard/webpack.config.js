const webpack = require("webpack");

module.exports = {
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },

  context: __dirname,
  entry: './script.js',
  output: {
    path: __dirname,
    filename: 'bundle.js'
  }
};
