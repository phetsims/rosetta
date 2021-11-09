// Copyright 2021, University of Colorado Boulder

const path = require( 'path' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );

module.exports = {
  entry: './src/client/index.js',
  output: {
    path: path.resolve( __dirname, 'static' ),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react'
            ]
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin( {
      template: './src/client/index.html'
    } )
  ]
};