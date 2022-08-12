// Copyright 2022, University of Colorado Boulder

import { execSync } from 'node:child_process';

/**
 * Return the current SHA of the running instance of Rosetta.
 *
 * @returns {string}
 */
const getCurrentSha = () => {
  console.log( 'info: trying to get current sha' );
  let retVal;
  try {

    // Slice off the \n from the end of the string.
    retVal = execSync( 'git rev-parse HEAD' ).toString().slice( 0, 40 );
  }
  catch( e ) {
    console.error( e );
    retVal = `error: ${e}`;
  }
  return retVal;
};

export default getCurrentSha;