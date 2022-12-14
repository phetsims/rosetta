// Copyright 2022, University of Colorado Boulder

/**
 * Get the SHA of the running instance of Rosetta.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { execSync } from 'node:child_process';

/**
 * Return the current SHA of the running instance of Rosetta.
 *
 * @returns {string}
 */
const getCurrentRosettaSha = () => {
  let sha = 'error: unable to get sha';
  try {

    // Slice off the \n from the end of the string.
    sha = execSync( 'git rev-parse HEAD' ).toString().slice( 0, 40 );
  }
  catch( e ) {
    console.error( e );
  }
  return sha;
};

export default getCurrentRosettaSha;