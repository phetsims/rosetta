// Copyright 2022, University of Colorado Boulder

/**
 * This module gets the configuration for Rosetta from ~/.phet/rosetta-config.json.
 *
 * @author Liam Mulhall
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import getCurrentRosettaSha from 'server/translationApi/getCurrentRosettaSha.js';

const pathToConfig = path.join( os.homedir(), '.phet', 'rosetta-config.json' );

let config = {};
try {
  const unparsedJson = fs.readFileSync( pathToConfig, 'utf8' );
  config = JSON.parse( unparsedJson );
  config.SHA = getCurrentRosettaSha();
}
catch( e ) {
  console.error( e );
  config = { error: 'unable to get configuration file for rosetta' };
}

export default config;