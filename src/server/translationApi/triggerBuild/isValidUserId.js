// Copyright 2022, University of Colorado Boulder

/**
 * Tell whether a given user ID is valid, i.e. whether it exists in the file it's supposed to exist in.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import getTranslatedStringFile from '../getTranslatedStringFileUrl.js';
import logger from '../logger.js';
import isStringNumber from './isStringNumber.js';

/**
 * Return a boolean for whether the given user ID is in the string file it's supposed to be in.
 *
 * @param {String} simName - the name of the sim being rebuilt
 * @param {String} locale - the locale code of the sim being rebuilt
 * @param {String} userId - the user ID of the original submitter
 * @returns {Promise<Boolean>}
 */
const isValidUserId = async ( simName, locale, userId ) => {
  let ret = false;
  if ( isStringNumber( userId ) ) {
    const stringFileUrl = getTranslatedStringFile( simName, locale );

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
  }
  return ret;
};

export default isValidUserId;