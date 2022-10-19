// Copyright 2022, University of Colorado Boulder

/**
 * GitHub issue https://github.com/phetsims/number-line-integers/issues/97 describes a situation in which a string was
 * moved from number-line-integers to number-line-common, and the string key was renamed.  This script is intended to
 * identify all cases where a translation of this string exists in number-line-integers but does not yet exist in
 * number-line-common and move it.
 */

// modules
const _ = require( 'lodash' );
const fs = require( 'fs' );

// string keys in the sim-specific and common-code string files
const SIM_SPECIFIC_STRING_KEY = 'range';
const COMMON_CODE_STRING_KEY = 'rangePattern';

// directories where the string files reside
const SIM_SPECIFIC_STRINGS_DIRECTORY = '../../babel/number-line-integers/';
const COMMON_CODE_STRINGS_DIRECTORY = '../../babel/number-line-common/';

// stem of the common code file name
const COMMON_CODE_FILE_NAME_STEM = 'number-line-common-strings';

// get the list string files from the sim directory
const simSpecificTranslatedStringFiles = fs.readdirSync( SIM_SPECIFIC_STRINGS_DIRECTORY );

// get the list of string files that exist in the common code directory
const commonCodeTranslatedStringFiles = fs.readdirSync( COMMON_CODE_STRINGS_DIRECTORY );

simSpecificTranslatedStringFiles.forEach( simSpecificTranslationFileName => {

  console.log( '-----------------------' );

  // extract the locale from the source file name
  const locale = simSpecificTranslationFileName.substring(
    simSpecificTranslationFileName.indexOf( '_' ) + 1,
    simSpecificTranslationFileName.indexOf( '.json' )
  );
  console.log( 'processing locale ' + locale );

  const simSpecificTranslationFilePath = SIM_SPECIFIC_STRINGS_DIRECTORY + simSpecificTranslationFileName;
  const simSpecificTranslationJson = fs.readFileSync( simSpecificTranslationFilePath );
  const simSpecificTranslation = JSON.parse( simSpecificTranslationJson );

  const translation = simSpecificTranslation[ SIM_SPECIFIC_STRING_KEY ];
  if ( translation ) {

    // Remove this key and value from the sim-specific translation file.
    delete simSpecificTranslation[ SIM_SPECIFIC_STRING_KEY ];
    fs.writeFileSync( simSpecificTranslationFilePath, JSON.stringify( simSpecificTranslation, null, 2 ) );
    console.log( 'key removed from sim-specific translation' );

    // Find the translation file for this locale if it exists in the common-code directory.
    const commonTranslationFileName = _.find( commonCodeTranslatedStringFiles, existingCommonCodeTranslation => {
      return existingCommonCodeTranslation.includes( locale );
    } );

    if ( !commonTranslationFileName ) {

      // No translation file exists yet for this locale, so create one with the translated string from the sim-specific
      // file.
      const commonCodeTranslationFileContent = {};
      commonCodeTranslationFileContent[ COMMON_CODE_STRING_KEY ] = translation;
      const newCommonCodeTranslationFileName = COMMON_CODE_FILE_NAME_STEM + '_' + locale + '.json';
      console.log( `creating new translation file ${newCommonCodeTranslationFileName}` );
      fs.writeFileSync(
        COMMON_CODE_STRINGS_DIRECTORY + newCommonCodeTranslationFileName,
        JSON.stringify( commonCodeTranslationFileContent, null, 2 )
      );
    }
    else {

      // Read in the common translation file.
      const commonTranslationJson = fs.readFileSync( COMMON_CODE_STRINGS_DIRECTORY + commonTranslationFileName );
      const commonTranslation = JSON.parse( commonTranslationJson );
      if ( commonTranslation[ COMMON_CODE_STRING_KEY ] ) {
        console.log( 'translation exists in common code file, nothing to be done here' );
      }
      else {
        console.log( 'adding translation to common code file' );
        commonTranslation[ COMMON_CODE_STRING_KEY ] = translation;
        fs.writeFileSync(
          COMMON_CODE_STRINGS_DIRECTORY + commonTranslation,
          JSON.stringify( commonTranslation, null, 2 )
        );
      }
    }
  }
} );