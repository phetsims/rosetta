// Copyright 2021, University of Colorado Boulder

import axios from 'axios';
import getCommonRepos from './getCommonRepos.js';
import getStringFileUrl from './getStringFileUrl.js';
import logger from './logger.js';

const getCommonEnglishStringKeysAndStrings = async ( simName, simNames, categorizedStringKeys, stringKeysWithRepoName ) => {
  logger.info( `getting ${simName}'s common english string keys and strings` );
  const stringKeysToCommonEnglishStrings = new Map();
  try {
    const commonRepos = await getCommonRepos( simName, simNames, stringKeysWithRepoName );
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

        // we don't display unused string keys and strings to the user
        // they get stripped out prior to sending them to the client
        stringKeysToCommonEnglishStrings.set( stringKey, 'no longer used' );
      }
    }
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( `got ${simName}'s common english string keys and strings; returning them` );
  return [ ...stringKeysToCommonEnglishStrings ];
};

export default getCommonEnglishStringKeysAndStrings;