// Copyright 2023, University of Colorado Boulder

const fs = require( 'fs' );
const assert = require( './assert.js' );

const DEFAULT_PATH_TO_TRANSLATIONS = '../../../babel';

/**
 * Get a list of all translated string files in the local copy of the babel repo.
 * @param {string} [pathToTranslationRepo]
 * @returns {string[]} list of names of translated string files
 */
module.exports = function getTranslatedStringFileList( pathToTranslationRepo = DEFAULT_PATH_TO_TRANSLATIONS ) {
  const listOfTranslatedStringFiles = [];

  assert( fs.existsSync( pathToTranslationRepo ), `Path to translations not found: ${pathToTranslationRepo}` );

  // divider for path if needed
  const divider = pathToTranslationRepo.charAt( pathToTranslationRepo.length - 1 ) === '/' ? '' : '/';

  // Read the files at the root level.
  const filesAtRootLevel = fs.readdirSync( pathToTranslationRepo );

  // Make a list of all the directories that are likely to contain translation files.
  const translationFileDirs = [];
  filesAtRootLevel.forEach( fileName => {
    const fullPath = `${pathToTranslationRepo}${divider}${fileName}`;
    if ( fileName.charAt( 0 ) !== '.' && fileName.charAt( 0 ) !== '_' && fs.lstatSync( fullPath ).isDirectory() ) {
      translationFileDirs.push( fullPath );
    }
  } );

  translationFileDirs.forEach( translationFileDir => {
    fs.readdirSync( translationFileDir ).forEach( translationFileName => {
      listOfTranslatedStringFiles.push( `${translationFileDir}/${translationFileName}` );
    } );
  } );

  return listOfTranslatedStringFiles;
};