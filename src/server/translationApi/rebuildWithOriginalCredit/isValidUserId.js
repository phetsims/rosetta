// Copyright 2022, University of Colorado Boulder

import axios from 'axios';
import config from '../../../common/config.js';
import logger from '../logger.js';

const isValidUserId = async ( simName, locale, userId ) => {

  let ret = false;

  const stringFileUrl = config.GITHUB_URL +
                        `phetsims/babel/master/${simName}/${simName}-strings_${locale}.json`;

  // Try to verify whether the supplied user ID exists in the string file for the given sim/locale.
  try {
    const stringFileRes = await axios.get( stringFileUrl );
    const stringFile = stringFileRes.data;
    const setOfUserIds = new Set();
    for ( const key of Object.keys( stringFile ) ) {
      const historyArray = stringFile[ key ].history;
      for ( const historyEntry of historyArray ) {
        setOfUserIds.add( historyEntry.userId );
      }
    }
    if ( setOfUserIds.has( userId ) ) {
      ret = true;
    }
  }
  catch( e ) {
    logger.error( e );
  }
  return ret;
};

export default isValidUserId;