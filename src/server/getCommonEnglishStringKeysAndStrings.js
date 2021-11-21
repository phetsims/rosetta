// Copyright 2021, University of Colorado Boulder

import axios from 'axios';
import getCategorizedStringKeys from './getCategorizedStringKeys.js';
import getCommonRepos from './getCommonRepos.js';
import getStringFileUrl from './getStringFileUrl.js';
import logger from './logger.js';

const getCommonEnglishStringKeysAndStrings = async simName => {
  const stringKeysToCommonEnglishStrings = new Map();
  try {
    const commonRepos = await getCommonRepos( simName );
    const categorizedStringKeys = await getCategorizedStringKeys( simName );
    const commonStringKeys = categorizedStringKeys.common;
    const stringFiles = [];
    for ( const repo of commonRepos ) {
      const stringFileUrl = getStringFileUrl( repo );
      const stringFileRes = await axios.get( stringFileUrl );
      stringFiles.push( stringFileRes.data );
    }
    for ( const stringKey of commonStringKeys ) {
      let stringKeyMapped = false;
      for ( const stringFile of stringFiles ) {
        const matchingKey = Object.keys( stringFile ).find( key => key === stringKey );
        if ( stringFile[ matchingKey ] ) {
          stringKeysToCommonEnglishStrings.set( stringKey, stringFile[ matchingKey ].value );
          stringKeyMapped = true;
        }
      }
      if ( !stringKeyMapped ) {
        stringKeysToCommonEnglishStrings.set( stringKey, 'no longer used' );
      }
    }
  }
  catch( e ) {
    logger.error( e );
  }
  return [ ...stringKeysToCommonEnglishStrings ];
};

export { getCommonEnglishStringKeysAndStrings as default };