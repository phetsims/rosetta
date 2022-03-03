// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that returns the translation file contents for a given repo and translation.
 *
 * @author Liam Mulhall
 */

import axios from 'axios';
import getTranslatedStringFileUrl from './getTranslatedStringFileUrl.js';
import logger from './logger.js';

/**
 * Return an object that has the exact contents of the translation file for the given repo and translation.
 *
 * @param {String} repo - repo we're making translation file contents for
 * @param {Object} translation - translation received from the client
 * @returns {Promise<Object>} - translation file contents for the given repo
 */
const makeTranslationFileContents = async ( repo, translation ) => {

  // the contents of each file we'll store long-term separated by repo
  const translationFileContents = {};

  // data will be different depending on whether the repo is the sim's repo or a common repo
  let data = {};

  // get old translation file if one exists
  const oldTranslationFileUrl = getTranslatedStringFileUrl( repo, translation.locale );
  let oldTranslationFile = null;
  try {
    const oldTranslationFileRes = await axios.get( oldTranslationFileUrl );
    if ( oldTranslationFileRes.status !== 404 ) {
      oldTranslationFile = oldTranslationFileRes.data;
    }
  }
  catch( e ) {
    if ( e.response.status === 404 ) {
      logger.verbose( `no translation file for ${translation.locale}/${repo}` );
    }
    else {
      logger.error( e );
    }
  }

  // determine what data will be
  if ( repo === translation.simName ) {
    data = translation.translationFormData.simSpecific;
  }
  else {
    const translatedData = translation.translationFormData.common;

    // only get data associated with the given repo
    for ( const stringKey of Object.keys( translatedData ) ) {
      if ( repo === translatedData[ stringKey ].repo ) {
        data[ stringKey ] = translatedData[ stringKey ];
      }
    }
  }

  // make translation file contents
  for ( const stringKey of Object.keys( data ) ) {

    // populate history object
    const newHistoryEntry = {
      userId: translation.userId,
      timestamp: translation.timestamp,
      oldValue: oldTranslationFile && oldTranslationFile[ stringKey ]
                ? oldTranslationFile[ stringKey ].value : '',
      newValue: data[ stringKey ].translated,
      explanation: null // this is no longer used, but for some reason we keep it around
    };

    // add the history object to the history array if it exists, otherwise make a new one with our history object
    const newHistory = oldTranslationFile && oldTranslationFile[ stringKey ]
                       ? oldTranslationFile[ stringKey ].history.push( newHistoryEntry ) : [ newHistoryEntry ];

    // add translated value and history to translation file
    translationFileContents[ stringKey ] = {
      value: data[ stringKey ].translated,
      history: newHistory
    };
  }

  return translationFileContents;
};

export default makeTranslationFileContents;