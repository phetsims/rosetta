// Copyright 2022, University of Colorado Boulder

/**
 * Request a rebuild of a sim using the original submitter's user ID.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import logger from '../logger.js';
import requestBuild from '../requestBuild.js';
import isValidLocale from './isValidLocale.js';
import isValidSimName from './isValidSimName.js';
import isValidUserId from './isValidUserId.js';

/**
 * Perform a build request using the correct user ID.
 *
 * @param {String} simName - name of the sim being rebuilt
 * @param {String} locale - locale code of the sim being rebuilt
 * @param {String} userId - user ID of the original submitter
 */
const requestTriggerBuild = async ( simName, locale, userId ) => {
  try {
    const simNameIsValid = isValidSimName( simName );
    const localeIsValid = isValidLocale( locale );
    const userIdIsValid = isValidUserId( simName, locale, userId );
    if ( simNameIsValid && localeIsValid && userIdIsValid ) {
      await requestBuild( simName, locale, Number( userId ) );
    }
  }
  catch( e ) {
    logger.error( e );
  }
};

export default requestTriggerBuild;