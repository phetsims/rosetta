// Copyright 2024, University of Colorado Boulder

/**
 * Processes babel translation for certain code point combinations that we don't want, and makes replacements.
 *
 * See https://github.com/phetsims/website-meteor/issues/656#issuecomment-1970099190
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

// imports
const fs = require( 'fs' );
const getActiveRepos = require( '../../../perennial-alias/js/common/getActiveRepos' );

const activeRepos = getActiveRepos();

const replacementMap = {
  '\u093e\u0945': '\u0949' // see https://github.com/phetsims/website-meteor/issues/656#issuecomment-1970099190
};

// get a list of directories under ../babel
const reposToScan = fs.readdirSync( '../babel' ).filter( file => {
  return fs.statSync( `../babel/${file}` ).isDirectory() && activeRepos.includes( file );
} );

let globalChanged = false;

reposToScan.forEach( repo => {
  const translationFiles = fs.readdirSync( `../babel/${repo}` ).filter( file => file.startsWith( repo ) && file.endsWith( '.json' ) );

  translationFiles.forEach( translationFile => {
    const contents = fs.readFileSync( `../babel/${repo}/${translationFile}`, 'utf8' );

    const translation = JSON.parse( contents );

    const stringKeys = Object.keys( translation );

    let changed = false;

    stringKeys.forEach( stringKey => {
      const value = translation[ stringKey ]?.value;

      if ( value ) {
        for ( const [ key, replacement ] of Object.entries( replacementMap ) ) {
          if ( value.includes( key ) ) {
            const newValue = value.replaceAll( key, replacement );
            console.log( `Replacing ${value} with ${newValue} in ${repo}/${translationFile} for key ${stringKey}` );
            translation[ stringKey ].value = newValue;
            changed = true;
            globalChanged = true;
          }
        }
      }
    } );

    if ( changed ) {
      fs.writeFileSync( `../babel/${repo}/${translationFile}`, JSON.stringify( translation, null, 2 ) );
    }
  } );
} );

if ( globalChanged ) {
  console.log( 'Please run:\nperennial/bin/for-each.sh active-repos grunt generate-development-strings' );
}