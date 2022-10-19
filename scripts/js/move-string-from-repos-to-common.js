// Copyright 2022, University of Colorado Boulder

/**
 * NodeJS script for moving a string that is repeated in several sims to a location in common code.  This was originally
 * created to move the "Projector Mode" string to joist, but might be reusable later.  See
 * https://github.com/phetsims/joist/issues/342.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

/* eslint-env node */

// modules
const fs = require( 'fs' );
const _ = require( 'lodash' );

// constants
const SIMS_WITH_STRING = [
  'charges-and-fields',
  'gravity-and-orbits',
  'molecule-shapes',
  'rutherford-scattering',
  'states-of-matter'
];

// helper function
function extractLocaleFromFileName( fileName ) {
  const localeStartIndex = fileName.indexOf( '_' ) + 1;
  const localeEndIndex = fileName.indexOf( '.' );
  return fileName.substring( localeStartIndex, localeEndIndex );
}

console.log( 'Starting move.' );

SIMS_WITH_STRING.forEach( simName => {

  const pathToStringsDir = '../../babel/' + simName;
  const stringFileNameList = fs.readdirSync( pathToStringsDir );

  console.log( '================' );
  console.log( 'simName = ' + simName );

  stringFileNameList.forEach( stringFileName => {

    // read the string file and turn it into an object
    fs.readFileSync( pathToStringsDir + '/' + stringFileName, 'utf8' );
    const stringsObject = JSON.parse( fs.readFileSync( pathToStringsDir + '/' + stringFileName, 'utf8' ) );

    // look for a translation of the string and, if found, extract it and add it to the common code strings file
    _.keys( stringsObject ).forEach( stringKey => {
      if ( stringKey.indexOf( 'projectorMode' ) >= 0 || stringKey.indexOf( 'projectorColors' ) >= 0 ) {
        const locale = extractLocaleFromFileName( stringFileName );
        console.log( 'found translation for sim: ', simName, ', locale: ', locale );

        // find the joist string file for this locale
        const joistStringFileName = '../../babel/joist/joist-strings_' + locale + '.json';

        // read in the joist string data
        const joistStringsData = JSON.parse( fs.readFileSync( joistStringFileName, 'utf8' ) );

        // add in the new translated value
        joistStringsData.projectorMode = stringsObject[ stringKey ];

        // write the modified string file
        console.log( 'adding new string to file: ', joistStringFileName );
        fs.writeFileSync( joistStringFileName, JSON.stringify( joistStringsData, null, 2 ) );
      }
    } );
  } );
} );