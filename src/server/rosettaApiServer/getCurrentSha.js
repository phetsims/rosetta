// Copyright 2022, University of Colorado Boulder

import { exec } from 'node:child_process';
import logger from '../common/logger.js';

let currentSha = '';

logger.info( 'trying to get current sha' );
exec( 'git rev-parse HEAD', ( e, stdout, stderr ) => {
  if ( e ) {
    logger.error( e );
  }
  if ( stdout ) {
    currentSha = stdout;
    logger.info( 'got current sha' );
  }
  if ( stderr ) {
    logger.error( stderr );
  }
} );

export default currentSha;