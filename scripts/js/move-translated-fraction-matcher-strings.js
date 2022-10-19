// Copyright 2022, University of Colorado Boulder

/**
 * A script to move strings that were translated for the fraction-matcher sim that are no longer in that repo to the
 * fractions-common strings.  If the translation file does not exist in fractions-common, it creates one.  The created
 * files need to be copied into the target directory.  This is done so that they can be verified first.  See
 * https://github.com/phetsims/fraction-matcher/issues/107 for the origin story of this script.
 *
 * EXAMPLE USAGE:
 * node ./js/move-translated-fraction-matcher-strings.js
 */

// modules
const _ = require( 'lodash' );
const fs = require( 'fs' );

// string keys that need to be moved
const stringKeysToMove = [
  'myMatches',
  'ok',
  'timeNumberSec',
  'mixedNumbersChooseYourLevel',
  'fractionsChooseYourLevel'
];

// message to put in the explanation section in the strings file
const EXPLANATION = 'moved from fraction-matcher to fractions-common, see https://github.com/phetsims/fraction-matcher/issues/107';

// directories between which the translated strings will be transferred
const sourceStringsDirectory = '../babel/fraction-matcher/';
const destinationStringsDirectory = '../babel/fractions-common/';

console.log( 'sourceStringsDirectory = ' + sourceStringsDirectory );
console.log( 'destinationStringsDirectory = ' + destinationStringsDirectory );

// get the list string files from the source directory
const existingFractionMatcherTranslations = fs.readdirSync( sourceStringsDirectory );

// get the list of string files that already exist in the destination directory
const existingFractionCommonTranslations = fs.readdirSync( destinationStringsDirectory );

existingFractionMatcherTranslations.forEach( existingFractionMatcherTranslationFileName => {

  console.log( '-----------------------' );
  console.log( 'reading in existing fraction matcher translation ' + existingFractionMatcherTranslationFileName );

  const fractionMatcherTranslationJson = fs.readFileSync( sourceStringsDirectory +
                                                          existingFractionMatcherTranslationFileName );
  const fractionMatcherTranslation = JSON.parse( fractionMatcherTranslationJson );

  // extract the locale from the file name
  const locale = existingFractionMatcherTranslationFileName
    .replace( 'fraction-matcher-strings_', '' )
    .replace( '.json', '' );
  console.log( 'locale = ' + locale );

  // find the fractions-common translation for this locale if it exists
  const fractionsCommonTranslationFileName = _.find( existingFractionCommonTranslations, existingFractionsCommonTranslation => {
    return existingFractionsCommonTranslation.includes( locale );
  } );

  let fractionsCommonTranslation;
  if ( !fractionsCommonTranslationFileName ) {

    // no existing translation file exists for this locale, so create an empty translation object
    fractionsCommonTranslation = {};
  }
  else {

    // read in the fractions-common translation file
    const fractionsCommonTranslationJson = fs.readFileSync( destinationStringsDirectory +
                                                            fractionsCommonTranslationFileName );
    fractionsCommonTranslation = JSON.parse( fractionsCommonTranslationJson );
  }

  // track whether any changes are actually made to the translation
  let stringsMoved = false;

  // add any strings to the fractions-common translation that are needed
  stringKeysToMove.forEach( stringKeyToMove => {
    if ( fractionsCommonTranslation[ stringKeyToMove ] === undefined &&
         fractionMatcherTranslation[ stringKeyToMove ] !== undefined ) {
      fractionsCommonTranslation[ stringKeyToMove ] = fractionMatcherTranslation[ stringKeyToMove ];
      const historyIndex = fractionsCommonTranslation[ stringKeyToMove ].history.length - 1;
      fractionsCommonTranslation[ stringKeyToMove ].history[ historyIndex ].explanation = EXPLANATION;
      stringsMoved = true;
      console.log( 'moved string ' + stringKeyToMove );
    }
  } );

  // there is one special case of a string name that was changed and reformatted that must be handled
  if ( fractionsCommonTranslation.levelTitlePattern === undefined &&
       fractionMatcherTranslation.levelNumber !== undefined ) {

    fractionMatcherTranslation.levelNumber.value =
      fractionMatcherTranslation.levelNumber.value.replace( '{0}', '{{number}}' );
    fractionMatcherTranslation.levelNumber.history[ 0 ].newValue = fractionMatcherTranslation.levelNumber.value;
    fractionMatcherTranslation.levelNumber.history[ 0 ].explanation = EXPLANATION;
    fractionsCommonTranslation.levelTitlePattern = fractionMatcherTranslation.levelNumber;
    fractionsCommonTranslation.levelTitlePattern.history.newValue = fractionMatcherTranslation.levelNumber.value;
    stringsMoved = true;
    console.log( 'added string levelTitlePattern' );
  }

  // write the file with the new data locally (NOT to babel)
  if ( stringsMoved ) {
    const newTranslationFileName = './fractions-common-strings_' + locale + '.json';
    fs.writeFileSync( newTranslationFileName, JSON.stringify( fractionsCommonTranslation, null, 2 ) );
    console.log( 'wrote new translation file ' + newTranslationFileName );
  }
  else {
    console.log( 'no strings moved for this locale' );
  }
} );