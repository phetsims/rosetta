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
 * @returns {Promise<{translationFileContentsForRepo}>}
 */
const makeTranslationFileContentsForRepo = async ( repo, translation ) => {

  logger.info( `making translation file contents for ${repo}` );

  const translationFileContentsForRepo = {};

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
      logger.warn( `no translation file for ${translation.locale}/${repo}` );
    }
    else {
      logger.error( e );
    }
  }

  // set translation form data variable
  let translationFormData = {};
  if ( repo === translation.simName ) {

    // we're dealing with sim-specific strings
    translationFormData = translation.translationFormData.simSpecific;
  }
  else {

    // we're dealing with common strings
    translationFormData = translation.translationFormData.common;
  }

  /*
   * Now there are several scenarios:
   * (1) there hasn't been a translation of the string yet            stringNotYetTranslated
   *   (1.1) the translator leaves the string blank                   translationLeftBlank
   *     - solution: don't add the string to the file
   *   (1.2) the translator translates the string                     userProvidedTranslation
   *     - solution: add the user's translation to the file
   * (2) there has been a non-blank translation of the string         stringHasNonBlankTranslation
   *   (2.1) the translator erases the existing translation           translationErased
   *     - solution: keep the old non-blank translation (do nothing)
   *     - N.B. if a sim doesn't have a title or screen title, it breaks
   *   (2.2) the translator doesn't touch the existing translation    translationUntouched
   *     - solution: do nothing with the translation
   *   (2.3) the translator modifies the existing translation         translationModified
   *     - solution: use the translator's translation
   *
   * Remember, the translation file for each repo should only contain strings that have actually been translated. We
   * don't want any blank strings in the translation file.
   */
  for ( const stringKey of Object.keys( translationFormData ) ) {
    if ( repo === translation.simName || repo === translationFormData[ stringKey ].repo ) {

      // we're dealing with a string key associated with the repo we're interested in

      // now we'll set up booleans for our scenarios...

      // 1
      let stringNotYetTranslated = false;
      if ( !oldTranslationFile
           || Object.keys( oldTranslationFile ).length === 0
           || oldTranslationFile[ stringKey ] === ''
           || !oldTranslationFile[ stringKey ] ) {

        /*
         * A translation file for this repo doesn't exist yet. Technically, neither the second nor the third conditions
         * should ever be true.
         */
        stringNotYetTranslated = true;
      }

      // 1.1
      let translationLeftBlank = false;
      if ( stringNotYetTranslated && translationFormData[ stringKey ].translated === '' ) {

        /*
         * The string hasn't been translated yet and the user didn't provide a translation of the string.
         */
        translationLeftBlank = true;
      }

      // 1.2
      let userProvidedTranslation = false;
      if ( stringNotYetTranslated && translationFormData[ stringKey ].translated !== '' ) {

        /*
         * The string hasn't been translated yet, but the user provided a translation of the string.
         */
        userProvidedTranslation = true;
      }

      // 2
      let stringHasNonBlankTranslation = false;
      if ( oldTranslationFile && oldTranslationFile[ stringKey ] && oldTranslationFile[ stringKey ].value !== '' ) {

        /*
         * A translation file for the repo exists and the value for the string key isn't blank. If a translation file
         * exists and the string key has a translation, this should be true.
         */
        stringHasNonBlankTranslation = true;
      }

      // 2.1
      let translationErased = false;
      if ( stringHasNonBlankTranslation && translationFormData[ stringKey ].translated === '' ) {

        /*
         * If a string has been translated as a blank string, best-case scenario it will just be blank in the sim,
         * worst-case scenario it will cause the sim to throw an assertion and the sim won't load. If the blank string
         * is for the title of the sim or the title of a screen, an assertion will probably be thrown.
         */
        translationErased = true;
      }

      // 2.2
      let translationUntouched = false;
      if ( stringHasNonBlankTranslation
           && translationFormData[ stringKey ].translated === oldTranslationFile[ stringKey ].value ) {

        /*
         * A previous translation of the string exists, but in this particular translation, the translator doesn't touch
         * the string.
         */
        translationUntouched = true;
      }

      // 2.3
      let translationModified = false;
      if ( stringHasNonBlankTranslation &&
           translationFormData[ stringKey ].translated !== oldTranslationFile[ stringKey ].value ) {

        /*
         * A previous translation of the string exists, but in this particular translation, the translator modifies the
         * string.
         */
        translationModified = true;
      }

      // act on the values of the booleans...

      // 1.1
      if ( translationLeftBlank ) {
        logger.warn( `string for ${stringKey} not translated; not adding it to the translation file for ${repo}` );
      }

      // 1.2
      else if ( userProvidedTranslation ) {
        logger.warn( `user provided translation for previously untranslated string; adding ${stringKey}'s info to the translation file for ${repo}` );

        // populate history object
        const newHistoryEntry = {
          userId: translation.userId,
          timestamp: translation.timestamp,
          oldValue: '',
          newValue: translationFormData[ stringKey ].translated,
          explanation: null // this is no longer used, but for some reason we keep it around
        };

        // add translated value and history to translation file
        translationFileContentsForRepo[ stringKey ] = {
          value: translationFormData[ stringKey ].translated,
          history: [ newHistoryEntry ]
        };
      }

      // 2.1
      else if ( translationErased ) {
        logger.warn( `the translation for ${stringKey}'s string was erased; preserving old value of ${stringKey}` );
      }

      // 2.2
      else if ( translationUntouched ) {
        logger.warn( `the translation for ${stringKey}'s string was untouched; not adding it to the translation file for ${repo}` );
      }

      // 2.3
      else if ( translationModified ) {
        logger.warn( `the translation for ${stringKey}'s string was modified; adding it to the translation file for ${repo}` );

        // populate history object
        const newHistoryEntry = {
          userId: translation.userId,
          timestamp: translation.timestamp,
          oldValue: oldTranslationFile[ stringKey ].value,
          newValue: translationFormData[ stringKey ].translated,
          explanation: null // this is no longer used, but for some reason we keep it around
        };

        // add the history entry to the history array
        const newHistory = oldTranslationFile[ stringKey ].history.concat( [ newHistoryEntry ] );

        // add translated value and history to translation file
        translationFileContentsForRepo[ stringKey ] = {
          value: translationFormData[ stringKey ].translated,
          history: newHistory
        };
      }
      else {

        // we've hit some sort of weird corner case
        logger.error( `none of the scenarios for ${stringKey} were true; something has gone wrong` );
      }
    }
  }

  logger.info( `made translation file contents for ${repo}; returning them` );
  return translationFileContentsForRepo;
};

export default makeTranslationFileContentsForRepo;