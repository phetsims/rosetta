// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that returns the translation file contents for a given repo and translation.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import getTranslatedStringFileUrl from './getTranslatedStringFileUrl.js';
import logger from './logger.js';

/**
 * For a given repo, return an object that looks like:
 *
 * {
 *   "stringKeyA": {
 *     "value": "string key A value",
 *     "history": [
 *       {
 *         "userId": 123456,
 *         "timestamp": 1653082097154,
 *         "oldValue": "",
 *         "newValue": "string key A value",
 *         "explanation": null
 *       }
 *     ]
 *   },
 *   "stringKeyB": { ... },
 *   ...
 * }
 *
 * Essentially, it's the translation file contents for the given repo based on the translation provided.
 *
 * @param repo - the repo name in lowercase-kebab (repo-style)
 * @param translation - the translation object obtained from the client side
 * @returns {Promise<Object>}
 */
const makeTranslationFileContentsForRepo = async ( repo, translation ) => {

  logger.info( `making translation file contents for ${repo}` );

  const translationFileContentsForRepo = {};

  // Get old translation file if one exists.
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
      logger.warn( `no translation file for ${translation.locale}/${repo}` );
    }
    else {
      logger.error( e );
    }
  }

  // Set translation form data variable.
  let translationFormData = {};
  if ( repo === translation.simName ) {

    // We're dealing with sim-specific strings.
    translationFormData = translation.translationFormData.simSpecific;
  }
  else {

    // We're dealing with common strings.
    translationFormData = translation.translationFormData.common;
  }

  for ( const stringKey of Object.keys( translationFormData ) ) {
    if ( repo === translation.simName || repo === translationFormData[ stringKey ].repo ) {

      // Trim leading and trailing whitespace.
      // NOTE: If a user deliberately wants a space, this will change
      // the string from ' ' to '', which makes the string fall back
      // to English.
      translationFormData[ stringKey ].translated = translationFormData[ stringKey ].translated.trim();

      const stringNotYetTranslated = !oldTranslationFile ||
                                     Object.keys( oldTranslationFile ).length === 0 ||
                                     oldTranslationFile[ stringKey ] === '' ||
                                     !oldTranslationFile[ stringKey ];

      const translationLeftBlank = stringNotYetTranslated &&
                                   translationFormData[ stringKey ].translated === '';

      const userProvidedInitialTranslation = stringNotYetTranslated &&
                                             translationFormData[ stringKey ].translated !== '';

      const stringHasNonBlankTranslation = oldTranslationFile &&
                                           oldTranslationFile[ stringKey ] &&
                                           oldTranslationFile[ stringKey ].value !== '';

      const translationErased = stringHasNonBlankTranslation &&
                                translationFormData[ stringKey ].translated === '';

      const translationUntouched = stringHasNonBlankTranslation &&
                                   translationFormData[ stringKey ].translated === oldTranslationFile[ stringKey ].value;

      const translationModified = stringHasNonBlankTranslation &&
                                  translationFormData[ stringKey ].translated !== oldTranslationFile[ stringKey ].value;

      if ( translationLeftBlank ) {
        logger.verbose( `string for ${stringKey} not translated; not adding it to the translation file for ${repo}` );
      }

      else if ( userProvidedInitialTranslation ) {
        logger.verbose( `user provided translation for previously untranslated string; adding ${stringKey}'s info to the translation file for ${repo}` );

        // Populate history object.
        const newHistoryEntry = {
          userId: translation.userId,
          timestamp: translation.timestamp,
          oldValue: '',
          newValue: translationFormData[ stringKey ].translated
        };

        // Add translated value and history to translation file.
        translationFileContentsForRepo[ stringKey ] = {
          value: translationFormData[ stringKey ].translated,
          history: [ newHistoryEntry ]
        };
      }

      else if ( translationErased ) {
        logger.verbose( `blank value submitted for previously translated string ${stringKey}; submitting blank value` );
        const newHistoryEntry = {
          userId: translation.userId,
          timestamp: translation.timestamp,
          oldValue: '',
          newValue: translationFormData[ stringKey ].translated
        };
        translationFileContentsForRepo[ stringKey ] = {
          value: translationFormData[ stringKey ].translated,
          history: [ newHistoryEntry ]
        };
      }

      else if ( translationUntouched ) {
        logger.verbose( `the translation for ${stringKey}'s string was untouched; using old entry` );
        translationFileContentsForRepo[ stringKey ] = oldTranslationFile[ stringKey ];
      }

      else if ( translationModified ) {
        logger.verbose( `the translation for ${stringKey}'s string was modified; adding it to the translation file for ${repo}` );

        // Populate history object.
        const newHistoryEntry = {
          userId: translation.userId,
          timestamp: translation.timestamp,
          oldValue: oldTranslationFile[ stringKey ].value,
          newValue: translationFormData[ stringKey ].translated,
          explanation: null // this is no longer used, but for some reason we keep it around
        };

        // Add the history entry to the history array.
        const newHistory = oldTranslationFile[ stringKey ].history.concat( [ newHistoryEntry ] );

        // Add translated value and history to translation file.
        translationFileContentsForRepo[ stringKey ] = {
          value: translationFormData[ stringKey ].translated,
          history: newHistory
        };
      }
      else {

        // We've hit some sort of weird corner case.
        logger.error( `none of the scenarios for ${stringKey} were true; something has gone horribly wrong` );
      }
    }
  }

  logger.info( `made translation file contents for ${repo}; returning them` );

  if ( JSON.stringify( translationFileContentsForRepo ) === JSON.stringify( oldTranslationFile ) ) {
    return {};
  }
  return translationFileContentsForRepo;
};

export default makeTranslationFileContentsForRepo;