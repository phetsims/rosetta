// Copyright 2021, University of Colorado Boulder

import axios from 'axios';
import getCategorizedStringKeys from './getCategorizedStringKeys.js';
import getRepoNameFromStringKeyWithRepoName from './getRepoNameFromStringKeyWithRepoName.js';
import getSimHtml from './getSimHtml.js';
import getSimUrl from './getSimUrl.js';
import getStringKeyFromStringKeyWithRepoName from './getStringKeyFromStringKeyWithRepoName.js';
import getStringKeysWithRepoName from './getStringKeysWithRepoName.js';
import getTranslatedStringFile from './getTranslatedStringFileUrl.js';
import logger from './logger.js';

const getCommonTranslatedStringKeysAndStrings = async ( simName, locale ) => {
  const commonTranslatedStringKeysAndStrings = new Map();
  try {
    const categorizedStringKeys = await getCategorizedStringKeys( simName );
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
        const repoName = stringKeyToRepoName.get( stringKey );        // inefficient
        const babelUrl = getTranslatedStringFile( repoName, locale ); // inefficient
        const translatedStringKeysAndStringsRes = await axios.get( babelUrl );
        const translatedStringKeysAndStrings = translatedStringKeysAndStringsRes.data;
        if ( translatedStringKeysAndStrings[ stringKey ] ) {
          commonTranslatedStringKeysAndStrings.set( stringKey, translatedStringKeysAndStrings[ stringKey ].value );
        }
        else {
          commonTranslatedStringKeysAndStrings.set( stringKey, '' );
        }
      }
    }
  }
  catch( e ) {
    logger.error( e );
  }
  return [ ...commonTranslatedStringKeysAndStrings ];
};

export { getCommonTranslatedStringKeysAndStrings as default };