// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that returns the translation file contents for a given repo and translation.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { ClientSubmittedTranslationData } from '../../common/ClientSubmittedTranslationData.js';
import { CommonAndSharedTranslationFormStrings, SimSpecificTranslationFormStrings } from '../../common/TranslationFormData.js';
import getSimMetadata from './getSimMetadata.js';
import getSimNamesAndTitles from './getSimNamesAndTitles.js';
import logger from './logger.js';
import makeNewHistoryArray from './makeNewHistoryArray.js';
import { HistoryEntry, TranslationDataForRepo } from './RosettaServerDataTypes.js';
import { longTermStorage } from './translationApi.js';

/**
 * Return the translation file contents for the given repo based on the translation provided.
 *
 * @param repo - the repo name in lowercase-kebab (repo-style)
 * @param translation - the translation object obtained from the client side
 * @returns A promise resolving to the translation file contents for the repo
 */
const makeTranslationFileContentsForRepo = async (
  repo: string,
  translation: ClientSubmittedTranslationData )
  : Promise<TranslationDataForRepo> => {

  logger.info( `making translation file contents for ${repo}` );

  const translationFileContentsForRepo: TranslationDataForRepo = {};

  const oldTranslationFile: TranslationDataForRepo | null = await longTermStorage.get( repo, translation.locale );

  // Get list of sim names for checking if we're dealing with shared strings. Note how we're passing true for the second
  // argument. This is to say we're a team member, so please get all the sims, even the ones that wouldn't normally be
  // visible, e.g. Bumper. For context on this, see https://github.com/phetsims/rosetta/issues/360 and
  // https://github.com/phetsims/rosetta/issues/361.
  const simMetadata = await getSimMetadata();
  const simNames = Object.keys( getSimNamesAndTitles( simMetadata, true ) );

  let translationFormStringsObject: SimSpecificTranslationFormStrings | CommonAndSharedTranslationFormStrings;
  if ( repo === translation.simName ) {

    // We're dealing with sim-specific strings.
    translationFormStringsObject = translation.translationFormData.simSpecific;
  }
  else if ( simNames.includes( repo ) ) {

    // We're dealing with shared strings.
    translationFormStringsObject = translation.translationFormData.shared;
  }
  else {

    // We're dealing with common strings.
    translationFormStringsObject = translation.translationFormData.common;
  }

  // We want to iterate over the keys contained in the union of the set of old string keys and the set of string keys in
  // the translation form data. See https://github.com/phetsims/rosetta/issues/378.
  const stringKeysToIterateOver = oldTranslationFile ? Object.keys( oldTranslationFile ) : [];
  for ( const stringKey of Object.keys( translationFormStringsObject ) ) {
    if ( !stringKeysToIterateOver.includes( stringKey ) ) {
      stringKeysToIterateOver.push( stringKey );
    }
  }

  for ( const stringKey of stringKeysToIterateOver ) {

    const ableToCheckStringKeyCases =
      repo === translation.simName ||
      ( translationFormStringsObject[ stringKey ] && 'repo' in translationFormStringsObject[ stringKey ] && repo === translationFormStringsObject[ stringKey ].repo ) ||
      ( oldTranslationFile && oldTranslationFile[ stringKey ] );

    if ( ableToCheckStringKeyCases ) {

      // Trim leading and trailing whitespace.  NOTE: If a user deliberately wants a space, this will change the string
      // from ' ' to '', which makes the string fall back to English. In this case, they should use a non-breaking space
      // character instead. A non-breaking space character is &nbsp;.
      if ( translationFormStringsObject[ stringKey ] ) {
        translationFormStringsObject[ stringKey ].translated = translationFormStringsObject[ stringKey ].translated.trim();
      }

      const stringNotYetTranslated = !oldTranslationFile ||
                                     !( stringKey in oldTranslationFile ) ||
                                     oldTranslationFile[ stringKey ].value === '';

      const translationLeftBlank = stringNotYetTranslated &&
                                   translationFormStringsObject[ stringKey ] &&
                                   translationFormStringsObject[ stringKey ].translated === '';

      const userProvidedInitialTranslation = stringNotYetTranslated &&
                                             translationFormStringsObject[ stringKey ] &&
                                             translationFormStringsObject[ stringKey ].translated !== '';

      const stringHasNonBlankTranslation = oldTranslationFile &&
                                           oldTranslationFile[ stringKey ] &&
                                           oldTranslationFile[ stringKey ].value !== '';

      const stringHasBlankTranslation = oldTranslationFile &&
                                        oldTranslationFile[ stringKey ] &&
                                        oldTranslationFile[ stringKey ].value === '';

      const translationErased = stringHasNonBlankTranslation &&
                                translationFormStringsObject[ stringKey ] &&
                                translationFormStringsObject[ stringKey ].translated === '';

      const translationUntouched = stringHasNonBlankTranslation &&
                                   translationFormStringsObject[ stringKey ] &&
                                   translationFormStringsObject[ stringKey ].translated === oldTranslationFile[ stringKey ].value;

      const translationModified = ( stringHasNonBlankTranslation || stringHasBlankTranslation ) &&
                                  translationFormStringsObject[ stringKey ] &&
                                  translationFormStringsObject[ stringKey ].translated !== oldTranslationFile[ stringKey ].value;

      const stringKeyNotInSim = stringHasNonBlankTranslation &&
                                !translationFormStringsObject[ stringKey ];

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
          newValue: translationFormStringsObject[ stringKey ].translated
        };

        // Add translated value and history to translation file.
        translationFileContentsForRepo[ stringKey ] = {
          value: translationFormStringsObject[ stringKey ].translated,
          history: [ newHistoryEntry ]
        };
      }
      else if ( translationErased ) {
        logger.verbose( `blank value submitted for previously translated string ${stringKey}; submitting blank value` );
        const newHistoryEntry: HistoryEntry = {
          userId: translation.userId,
          timestamp: translation.timestamp,
          oldValue: oldTranslationFile[ stringKey ].value,
          newValue: translationFormStringsObject[ stringKey ].translated
        };

        const newHistoryArray = makeNewHistoryArray(
          stringKey,
          oldTranslationFile,
          newHistoryEntry
        );

        translationFileContentsForRepo[ stringKey ] = {
          value: translationFormStringsObject[ stringKey ].translated,
          history: newHistoryArray
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
          newValue: translationFormStringsObject[ stringKey ].translated,
          explanation: null // this is no longer used, but for some reason we keep it around
        };

        const newHistoryArray = makeNewHistoryArray( stringKey, oldTranslationFile, newHistoryEntry );

        // Add translated value and history to translation file.
        translationFileContentsForRepo[ stringKey ] = {
          value: translationFormStringsObject[ stringKey ].translated,
          history: newHistoryArray
        };
      }
      else if ( stringKeyNotInSim ) {

        // Preserve the unused string key object for other sims.
        translationFileContentsForRepo[ stringKey ] = oldTranslationFile[ stringKey ];
      }
      else {

        // We've hit some sort of weird corner case.
        logger.error( `none of the scenarios for ${stringKey} were true; something has gone horribly wrong` );
      }
    }
  }

  // Return an empty object if the translation file hasn't changed.
  if ( JSON.stringify( translationFileContentsForRepo ) === JSON.stringify( oldTranslationFile ) ) {
    logger.info( `translation file contents unchanged for ${repo}, returning empty object` );
    return {};
  }

  logger.info( `made translation file contents for ${repo}, returning them` );
  return translationFileContentsForRepo;
};

export default makeTranslationFileContentsForRepo;