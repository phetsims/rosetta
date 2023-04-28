// Copyright 2022, University of Colorado Boulder

/**
 * Make the public config file that has values the client-side code needs right away like
 * whether the utility is enabled, where to get website user data, whether we're in dev
 * or in production, etc. Once this file is made, the client-side code simply imports it.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import fs from 'fs';
import privateConfig from '../../src/common/privateConfig.js';

// These are the keys whose values we want to extract from the private config file.
const PUBLIC_CONFIG_VALUES = [
  'IS_ENABLED',
  'WEBSITE_USER_DATA_URL',
  'ENVIRONMENT',
  'LOCAL_USER_ID',
  'VALID_METADATA_DURATION',
  'SIGN_OUT_URL'
];

// These are constants used in the client-side code. We want them in the public config.
const CLIENT_CONSTANTS = {
  singleBraceRegex: /\{\d+\}/g,
  doubleBraceRegex: /\{\{\w+\}\}/g,
  translationApiRoute: '/translate/api'
};

let publicConfigString = '/* eslint-disable */\n';
publicConfigString += '// Note: This is a build artifact. Do not modify directly.\n';
publicConfigString += 'export default {\n';

const addQuotes = ( key, object ) => {

  // If value is string, we need to add quotes.
  return typeof object[ key ] === 'string' ?
         '\'' + object[ key ] + '\'' :
         object[ key ];
};

// Add the public values to the file string.
for ( const key of Object.keys( privateConfig ) ) {
  if ( PUBLIC_CONFIG_VALUES.includes( key ) ) {
    const value = addQuotes( key, privateConfig );
    publicConfigString += `  ${key}: ${value},\n`;
  }
}

// Add the client constants to the file string.
for ( const key of Object.keys( CLIENT_CONSTANTS ) ) {
  const value = addQuotes( key, CLIENT_CONSTANTS );
  publicConfigString += `  ${key}: ${value},\n`;
}

// Add the ending curly brace.
publicConfigString += '};';

// This script is meant to be run from the root of the rosetta repo, hence this file path.
const pathToPublicConfig = './src/common/publicConfig.js';

console.log( 'info: making public config file' );
fs.writeFileSync( pathToPublicConfig, publicConfigString );
console.log( 'info: made public config file' );