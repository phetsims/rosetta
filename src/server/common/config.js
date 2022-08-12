// Copyright 2022, University of Colorado Boulder

import fs from 'fs';
import os from 'os';
import path from 'path';
import getCurrentSha from '../translationApi/getCurrentSha.js';

const pathToConfig = path.join( os.homedir(), '.phet', 'rosetta-config.json' );

let config = {};
try {
  const unparsedJson = fs.readFileSync( pathToConfig, 'utf8' );
  config = JSON.parse( unparsedJson );
  config.SHA = getCurrentSha();
}
catch( e ) {
  console.error( e );
}

export default config;