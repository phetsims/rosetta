// Copyright 2021, University of Colorado Boulder

import axios from 'axios';
import getRepoNameFromStringKeyWithRepoName from './getRepoNameFromStringKeyWithRepoName.js';
import getSimHtml from './getSimHtml.js';
import getSimUrl from './getSimUrl.js';
import getStringKeyFromStringKeyWithRepoName from './getStringKeyFromStringKeyWithRepoName.js';
import getStringKeysWithRepoName from './getStringKeysWithRepoName.js';
import getTranslatedStringFileUrl from './getTranslatedStringFileUrl.js';
import logger from './logger.js';

const getCommonTranslatedStringKeysAndStrings = async ( simName, locale, categorizedStringKeys ) => {
  logger.info( `getting ${simName}'s common translated string keys and strings` );
  const commonTranslatedStringKeysAndStrings = new Map();
  try {
    const commonStringKeys = categorizedStringKeys.common;
    const simUrl = getSimUrl( simName );
    const simHtml = await getSimHtml( simUrl );
    const stringKeysWithRepoName = getStringKeysWithRepoName( simHtml );
    const stringKeyToRepoName = new Map();
    for ( const stringKeyWithRepoName of stringKeysWithRepoName ) {
      const stringKey = getStringKeyFromStringKeyWithRepoName( stringKeyWithRepoName );
      const repoName = getRepoNameFromStringKeyWithRepoName( stringKeyWithRepoName );
      stringKeyToRepoName.set( stringKey, repoName );
    }
    for ( const stringKey of commonStringKeys ) {
      if ( stringKeyToRepoName.has( stringKey ) ) {
        const repoName = stringKeyToRepoName.get( stringKey );                          // inefficient
        const translatedStringFileUrl = getTranslatedStringFileUrl( repoName, locale ); // inefficient
        try {
          const translatedStringKeysAndStringsRes = await axios.get( translatedStringFileUrl );
          const translatedStringKeysAndStrings = translatedStringKeysAndStringsRes.data;
          if ( translatedStringKeysAndStrings[ stringKey ] ) {
            commonTranslatedStringKeysAndStrings.set( stringKey, translatedStringKeysAndStrings[ stringKey ].value );
          }
          else {
            commonTranslatedStringKeysAndStrings.set( stringKey, '' );
          }
        }
        catch( e ) {
          if ( e.response.status === 404 ) {
            logger.verbose( `translated string file doesn't exist; setting empty string for ${stringKey}` );
            commonTranslatedStringKeysAndStrings.set( stringKey, '' );
          }
          else {
            logger.error( e );
          }
        }
      }
    }
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( `got ${simName}'s common translated string keys and strings; returning them` );
  return [ ...commonTranslatedStringKeysAndStrings ];
};

export { getCommonTranslatedStringKeysAndStrings as default };