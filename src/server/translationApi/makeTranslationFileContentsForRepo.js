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
   * TODO: This comment is probably going to become stale. Eventually, we'll want these
   *       comments to be interspersed in the code, and we'll delete this comment.
   *
   * Now there are several scenarios:
   * (1) there hasn't been a translation of the string yet
   *   (1.1) the translator leaves the string blank
   *     - solution: don't add the string to the file
   *   (1.2) the translator translates the string
   *     - solution: add the user's translation to the file
   * (2) there has been a non-blank translation of the string
   *   (2.1) the translator erases the existing translation
   *     - TODO: Actually need to submit this.
   *     - solution: don't allow user to submit blank
   *             translations (protect against this on both
   *             client and server)
   *     - N.B. if a sim doesn't have a title or screen title, it breaks
   *   (2.2) the translator doesn't touch the existing translation
   *     - solution: do nothing with the translation
   *   (2.3) the translator modifies the existing translation
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
      const stringNotYetTranslated = !oldTranslationFile ||
                                     Object.keys( oldTranslationFile ).length === 0 ||
                                     oldTranslationFile[ stringKey ] === '' ||
                                     !oldTranslationFile[ stringKey ];

      // 1.1
      // TODO: The client strips out blank values for strings, but we handle the case here for the sake of robustness.
      // TODO: Once you've implemented stripping out blank values on the client, make the above comment not a TODO.
      const translationLeftBlank = stringNotYetTranslated &&
                                   translationFormData[ stringKey ].translated === '';

      // 1.2
      const userProvidedInitialTranslation = stringNotYetTranslated &&
                                             translationFormData[ stringKey ].translated !== '';

      // 2
      const stringHasNonBlankTranslation = oldTranslationFile &&
                                           oldTranslationFile[ stringKey ] &&
                                           oldTranslationFile[ stringKey ].value !== '';

      // 2.1
      const translationErased = stringHasNonBlankTranslation &&
                                translationFormData[ stringKey ].translated === '';

      // 2.2
      const translationUntouched = stringHasNonBlankTranslation &&
                                   translationFormData[ stringKey ].translated === oldTranslationFile[ stringKey ].value;

      // 2.3
      const translationModified = stringHasNonBlankTranslation &&
                                  translationFormData[ stringKey ].translated !== oldTranslationFile[ stringKey ].value;

      // act on the values of the booleans...

      // 1.1
      if ( translationLeftBlank ) {
        logger.verbose( `string for ${stringKey} not translated; not adding it to the translation file for ${repo}` );
      }

      // 1.2
      else if ( userProvidedInitialTranslation ) {
        logger.verbose( `user provided translation for previously untranslated string; adding ${stringKey}'s info to the translation file for ${repo}` );

        // populate history object
        const newHistoryEntry = {
          userId: translation.userId,
          timestamp: translation.timestamp,
          oldValue: '',
          newValue: translationFormData[ stringKey ].translated
        };

        // add translated value and history to translation file
        translationFileContentsForRepo[ stringKey ] = {
          value: translationFormData[ stringKey ].translated,
          history: [ newHistoryEntry ]
        };
      }

      // 2.1
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

      // 2.2
      else if ( translationUntouched ) {
        logger.verbose( `the translation for ${stringKey}'s string was untouched; using old entry` );
        translationFileContentsForRepo[ stringKey ] = oldTranslationFile[ stringKey ];
      }

      // 2.3
      else if ( translationModified ) {
        logger.verbose( `the translation for ${stringKey}'s string was modified; adding it to the translation file for ${repo}` );

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