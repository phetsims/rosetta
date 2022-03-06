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

  logger.info( `making translation file contents for ${repo}` );

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

  if ( oldTranslationFile ) {

    // iterate through the string keys in the translation file and either update them or leave them as they are
    for ( const stringKey of Object.keys( oldTranslationFile ) ) {

      let stringWasTranslated = false;
      if ( data[ stringKey ] ) {
        stringWasTranslated = oldTranslationFile[ stringKey ].value !== data[ stringKey ].translated;
      }

      if ( stringWasTranslated ) {

        // populate history object
        const newHistoryEntry = {
          userId: translation.userId,
          timestamp: translation.timestamp,
          oldValue: oldTranslationFile[ stringKey ].value,
          newValue: data[ stringKey ].translated,
          explanation: null // this is no longer used, but for some reason we keep it around
        };

        // add the history entry to the history array
        const newHistory = oldTranslationFile[ stringKey ].history.concat( [ newHistoryEntry ] );

        // add translated value and history to translation file
        translationFileContents[ stringKey ] = {
          value: data[ stringKey ].translated,
          history: newHistory
        };
      }
      else {

        // string is unchanged
        translationFileContents[ stringKey ] = oldTranslationFile[ stringKey ];

      }
    }

    // iterate through string keys from the translation belonging to the repo
    // if they are in the old translation file, they've already been updated
    // otherwise, add them to the new translation file contents
    for ( const stringKey of Object.keys( data ) ) {
      if ( oldTranslationFile[ stringKey ] ) {
        logger.verbose( `string key ${stringKey} has already been updated; ignoring it` );
      }
      else {

        // populate history object
        const newHistoryEntry = {
          userId: translation.userId,
          timestamp: translation.timestamp,
          oldValue: '',
          newValue: data[ stringKey ].translated,
          explanation: null // this is no longer used, but for some reason we keep it around
        };

        // add translated value and history to translation file
        translationFileContents[ stringKey ] = {
          value: data[ stringKey ].translated,
          history: [ newHistoryEntry ]
        };
      }
    }

  }

  // translation file doesn't exist
  else {

    for ( const stringKey of Object.keys( data ) ) {

      // populate history object
      const newHistoryEntry = {
        userId: translation.userId,
        timestamp: translation.timestamp,
        oldValue: '',
        newValue: data[ stringKey ].translated,
        explanation: null // this is no longer used, but for some reason we keep it around
      };

      // add translated value and history to translation file
      translationFileContents[ stringKey ] = {
        value: data[ stringKey ].translated,
        history: [ newHistoryEntry ]
      };
    }

  }

  return translationFileContents;
};

export default makeTranslationFileContents;