// Copyright 2022, University of Colorado Boulder

/**
 * Export a shared function, see function header for details.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 * @author John Blanco (PhET Interactive Simulations)
 */

import { ClientSubmittedTranslationData } from '../../common/ClientSubmittedTranslationData.js';
import { CommonAndSharedTranslationFormStrings, SimSpecificTranslationFormStrings } from '../../common/TranslationFormData.js';
import getLocaleInfo, { LanguageDirection } from './getLocaleInfo.js';
import getRepoNameFromStringKeyWithRepoName from './getRepoNameFromStringKeyWithRepoName.js';
import getSimMetadata from './getSimMetadata.js';
import getSimNamesAndTitles from './getSimNamesAndTitles.js';
import getStringKeyFromStringKeyWithRepoName from './getStringKeyFromStringKeyWithRepoName.js';
import logger from './logger.js';
import { ExtendedStringKeyAndValue } from './RosettaServerDataTypes.js';

/**
 * Create an object in a format that is suitable for replacing the original strings in a sim's HTML with translated
 * strings.  This is generally used for testing translations in the Rosetta UI prior to submission and publication.
 *
 * @param stringKeysWithRepoName - an object of untranslated string keys and values where each property looks
 *                                 like this: "REPO_NAME/stringKey": "string value"
 * @param translation - the translation the user is working on
 * @returns A promise resolving to the replacement string object
 */
const getReplacementStringObject = async (
  stringKeysWithRepoName: ExtendedStringKeyAndValue,
  translation: ClientSubmittedTranslationData
): Promise<ExtendedStringKeyAndValue> => {

  logger.info( 'getting replacement string object' );

  const localeInfo = await getLocaleInfo();
  let direction: LanguageDirection = 'ltr';

  if ( !( 'error' in localeInfo ) && localeInfo[ translation.locale ]?.direction ) {
    direction = localeInfo[ translation.locale ].direction;
  }

  const simMetadata = await getSimMetadata();
  const simNames = Object.keys( getSimNamesAndTitles( simMetadata, true ) );

  for ( const stringKeyWithRepoName of Object.keys( stringKeysWithRepoName ) ) {
    const repoName = getRepoNameFromStringKeyWithRepoName( stringKeyWithRepoName );
    const stringKey = getStringKeyFromStringKeyWithRepoName( stringKeyWithRepoName );
    const stringKeyWithoutDots = stringKey.replaceAll( '.', '_DOT_' );
    if ( repoName === translation.simName ) {

      // We have a sim-specific repo.
      const simSpecificObject = translation.translationFormData.simSpecific;
      addEmbeddingMarks(
        simSpecificObject,
        stringKeyWithoutDots,
        stringKeysWithRepoName,
        stringKeyWithRepoName,
        direction
      );
    }
    else if ( simNames.includes( repoName ) ) {

      // We have a shared repo.
      const sharedObject = translation.translationFormData.shared;
      addEmbeddingMarks(
        sharedObject,
        stringKeyWithoutDots,
        stringKeysWithRepoName,
        stringKeyWithRepoName,
        direction
      );
    }
    else {

      // We have a common repo.
      const commonObject = translation.translationFormData.common;
      addEmbeddingMarks(
        commonObject,
        stringKeyWithoutDots,
        stringKeysWithRepoName,
        stringKeyWithRepoName,
        direction
      );
    }
  }
  logger.info( 'got replacement string object; returning it' );
  return stringKeysWithRepoName;
};

/**
 * If a key is translated, add embedding marks to it.
 *
 * @param stringsObject - the translation form data object, either sim-specific, shared, or common
 * @param stringKeyWithoutDots - string key with dots/periods replaced with _DOT_
 * @param stringKeysWithRepoName - object of REPO_NAME/stringKey: value
 * @param stringKeyWithRepoName - REPO_NAME/stringKey
 * @param direction - language direction; either left-to-right or right-to-left
 */
const addEmbeddingMarks = ( stringsObject: SimSpecificTranslationFormStrings | CommonAndSharedTranslationFormStrings,
                            stringKeyWithoutDots: string,
                            stringKeysWithRepoName: ExtendedStringKeyAndValue,
                            stringKeyWithRepoName: string,
                            direction: 'ltr' | 'rtl' ): void => {

  const keyIsPresent = Object.keys( stringsObject ).includes( stringKeyWithoutDots );
  const keyIsTranslated = keyIsPresent ? stringsObject[ stringKeyWithoutDots ].translated !== '' : false;
  if ( keyIsTranslated ) {

    // To understand why we're adding embedding marks, see https://github.com/phetsims/rosetta/issues/27.
    const ltrMark = '\u202a';
    const rtlMark = '\u202b';
    const endDirectionalMark = '\u202c';
    const translatedValue = stringsObject[ stringKeyWithoutDots ].translated;
    stringKeysWithRepoName[ stringKeyWithRepoName ] = direction === 'rtl' ?
                                                      rtlMark + translatedValue + endDirectionalMark :
                                                      ltrMark + translatedValue + endDirectionalMark;
  }
};

export default getReplacementStringObject;