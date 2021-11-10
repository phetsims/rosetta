// Copyright 2021, University of Colorado Boulder

// packages
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import { URL } from 'url';

// constants
const __dirname = new URL( '.', import.meta.url ).pathname;

const webpackConfig = {
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

export { webpackConfig as default };