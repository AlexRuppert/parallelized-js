const webpack = require('webpack');

const original = require('./webpack.config.js');
original.plugins = [
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.optimize.UglifyJsPlugin({
    minimize: true,
    mangle: true,
    compress: {
      warnings: false
    }
  }),
  new webpack.optimize.DedupePlugin()
];

module.exports = original;
