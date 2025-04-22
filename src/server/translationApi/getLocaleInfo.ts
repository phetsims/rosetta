// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that gets locale info.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 * @author John Blanco (PhET Interactive Simulations)
 */

import privateConfig from '../../common/privateConfig.js';
import logger from './logger.js';

export type LanguageDirection = 'ltr' | 'rtl';

export type LocaleInfoEntry = {
  name: string;
  localizedName: string;
  direction: LanguageDirection;
};

export type LocaleInfo = Record<string, LocaleInfoEntry>;

// The time of the last update of the locale info. This is used to determine if the locale info is stale.
let timeOfLastUpdate: number = Number.NEGATIVE_INFINITY;

// The most recently obtained locale info.  This is the cached data.
let localeInfo: Record<string, LocaleInfoEntry> | { error: string };

// This promise is used to ensure that only one request for locale info is made at a time.
let currentUpdatePromise: Promise<Record<string, LocaleInfoEntry> | { error: string }> | null = null;

/**
 * Return the locale info stored in a remote repository. This locale info contains names of locales and locale codes.
 *
 * @returns A promise resolving to locale info, i.e., names of locales and ISO 639-1 locale codes.
 */
const getLocaleInfo = async (): Promise<LocaleInfo | { error: string }> => {
  logger.info( 'getting locale info' );

  if ( currentUpdatePromise ) {
    logger.info( 'request for locale info already in progress; waiting for it to complete' );
    return currentUpdatePromise;
  }

  const localeInfoValidDurationElapsed = timeOfLastUpdate + privateConfig.VALID_LOCALE_INFO_DURATION < Date.now();

  if ( !localeInfoValidDurationElapsed ) {
    logger.info( 'using cached locale info' );
    return localeInfo;
  }

  currentUpdatePromise = ( async () => {
    try {
      logger.info( 'locale info is stale or nonexistent; getting it' );
      const localeInfoUrl = `${privateConfig.GITHUB_URL}/chipper/main/data/localeInfo.json`;
      const response = await fetch( localeInfoUrl );

      if ( response.ok ) {
        const fetchedLocaleInfo = await response.json() as Record<string, LocaleInfoEntry>;

        // Delete the English locale; we don't want people translating it.
        delete fetchedLocaleInfo.en;

        // Delete any comments embedded in the locale info file.
        if ( fetchedLocaleInfo && '_comment' in fetchedLocaleInfo ) {
          delete fetchedLocaleInfo._comment;
        }

        localeInfo = fetchedLocaleInfo;
        timeOfLastUpdate = Date.now();
        logger.info( 'locale info obtained successfully' );
      }
      else {
        logger.error( `unable to get locale info; status: ${response.status}` );
        localeInfo = { error: 'unable to get locale info' };
      }
    }
    catch( e ) {
      logger.error( e );
      localeInfo = { error: 'unable to get locale info' };
    }
    finally {
      currentUpdatePromise = null; // Clear the promise after the update is complete
    }

    return localeInfo;
  } )();

  return currentUpdatePromise;
};

export default getLocaleInfo;