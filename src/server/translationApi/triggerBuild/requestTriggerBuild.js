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
 * @returns {Promise.<Boolean>} - whether the request succeeded
 */
const requestTriggerBuild = async ( simName, locale, userId ) => {
  logger.info( `requesting a trigger build for sim/locale/id ${simName}/${locale}/${userId}` );
  let requestSuccessful = false;
  try {
    const simNameIsValid = await isValidSimName( simName );
    const localeIsValid = await isValidLocale( locale );
    const userIdIsValid = await isValidUserId( simName, locale, userId );
    if ( simNameIsValid && localeIsValid && userIdIsValid ) {
      requestSuccessful = await requestBuild( simName, locale, Number( userId ) );
    }
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( `request of trigger build for sim/locale/id ${simName}/${locale}/${userId} succeeded = ${requestSuccessful}` );
  return requestSuccessful;
};

export default requestTriggerBuild;