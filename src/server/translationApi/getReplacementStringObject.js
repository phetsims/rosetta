// Copyright 2022, University of Colorado Boulder

/**
 * Create a replacement string object to replace the original string object in a sim's HTML. Used for testing out
 * translations. When the user clicks the test button, the string object in the sim's HTML is replaced with the
 * one obtained from this function.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getLocaleInfo from './getLocaleInfo.js';
import getRepoNameFromStringKeyWithRepoName from './getRepoNameFromStringKeyWithRepoName.js';
import getSimMetadata from './getSimMetadata.js';
import getSimNamesAndTitles from './getSimNamesAndTitles.js';
import getStringKeyFromStringKeyWithRepoName from './getStringKeyFromStringKeyWithRepoName.js';
import logger from './logger.js';

/**
 * If a key is translated, add embedding marks to it.
 *
 * @param {Object} stringsObject - the translation form data object, either sim-specific, shared, or common
 * @param stringKeyWithoutDots - string key with dots/periods replaced with _DOT_
 * @param stringKeysWithRepoName - object of REPO_NAME/stringKey: value
 * @param stringKeyWithRepoName - REPO_NAME/stringKey
 * @param direction - language direction; either left-to-right or right-to-left
 */
const addEmbeddingMarks = (
  stringsObject,
  stringKeyWithoutDots,
  stringKeysWithRepoName,
  stringKeyWithRepoName,
  direction
) => {
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

/**
 * Return the replacement string object for a given sim and in-progress translation.
 *
 * @param stringKeysWithRepoName - object of REPO_NAME/stringKey: value
 * @param translation - the translation the user is working on
 * @returns {Promise<Object>} - the replacement string object
 */
const getReplacementStringObject = async ( stringKeysWithRepoName, translation ) => {
  logger.info( 'getting replacement string object' );

  const localeInfo = await getLocaleInfo();
  const direction = localeInfo[ translation.locale ].direction;

  // Get list of sim names for checking if we're dealing with shared strings. Note how
  // we're passing true for the second argument. This is to say we're a team member, so
  // please get all the sims, even the ones that wouldn't normally be visible, e.g. Bumper.
  // For context on this, see https://github.com/phetsims/rosetta/issues/360 and
  // https://github.com/phetsims/rosetta/issues/361.
  const simMetadata = await getSimMetadata();
  const simNames = Object.keys( getSimNamesAndTitles( simMetadata, 'true' ) );

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

export default getReplacementStringObject;