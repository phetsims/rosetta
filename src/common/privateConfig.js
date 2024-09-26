// Copyright 2022, University of Colorado Boulder

/**
 * This module gets the configuration for Rosetta from ~/.phet/rosetta-config.json.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import fs from 'fs';
import os from 'os';
import path from 'path';

export const pathToConfig = path.join( os.homedir(), '.phet', 'rosetta-config.json' );

let privateConfig = { error: 'unable to get configuration file for rosetta' };
try {
  const unparsedJson = fs.readFileSync( pathToConfig, 'utf8' );
  privateConfig = JSON.parse( unparsedJson );
}
catch( e ) {
  console.error( e );
}

// eslint-disable-next-line phet/bad-text
if ( privateConfig.BABEL_BRANCH && privateConfig.BABEL_BRANCH === 'master' ) {

  // eslint-disable-next-line phet/bad-text
  console.error( 'The branch name "master" is no longer supported, please update your config.  Aborting.' );
  throw new Error( 'Invalid branch name for string repo.' );
}

export default privateConfig;