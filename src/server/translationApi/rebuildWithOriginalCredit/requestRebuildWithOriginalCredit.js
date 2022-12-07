// Copyright 2022, University of Colorado Boulder

/**
 * Request a rebuild of a sim using the original submitter's user ID.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import config from '../../../common/config.js';
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
const requestRebuildWithOriginalCredit = async ( simName, locale, userId ) => {
  try {

    // TODO: This won't work in production. We need to send the user ID from the client.
    // TODO: Send the user ID as a query parameter.
    // TODO: This also won't work since the check-login URL is changing.
    const userDataRes = await axios.get( `${config.SERVER_URL}/services/check-login` );
    const userData = userDataRes.data;
    if ( userData.loggedIn && userData.teamMember ) {
      const simNameIsValid = isValidSimName( simName );
      const localeIsValid = isValidLocale( locale );

      // TODO: Fix function signature.
      const userIdIsValid = isValidUserId( userId );
      if ( simNameIsValid && localeIsValid && userIdIsValid ) {
        await requestBuild( simName, locale, userId );
      }
    }
  }
  catch( e ) {
    logger.error( e );
  }
};

export default requestRebuildWithOriginalCredit;