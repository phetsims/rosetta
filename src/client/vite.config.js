// Copyright 2022, University of Colorado Boulder

/**
 * This is the configuration file for Vite, the transpiler/bundler we use.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig( {
  plugins: [ react() ],
  build: {
    sourcemap: true,
    assetsDir: 'translate/assets'
  }
} );