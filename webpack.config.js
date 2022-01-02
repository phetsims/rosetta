// Copyright 2021, University of Colorado Boulder

import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import { URL } from 'url';

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
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin( {
      template: './src/client/index.html',
      favicon: './src/client/img/favicon.ico'
    } )
  ]
};

export { webpackConfig as default };