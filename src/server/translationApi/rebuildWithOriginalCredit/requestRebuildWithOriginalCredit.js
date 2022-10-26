// Copyright 2022, University of Colorado Boulder

import axios from 'axios';
import config from '../../../common/config.js';
import logger from '../logger.js';
import requestBuild from '../requestBuild.js';
import isValidLocale from './isValidLocale.js';
import isValidSimName from './isValidSimName.js';
import isValidUserId from './isValidUserId.js';

const requestRebuildWithOriginalCredit = async ( simName, locale, userId ) => {
  try {
    const userDataRes = await axios.get( `${config.SERVER_URL}/services/check-login` );
    const userData = userDataRes.data;
    if ( userData.loggedIn && userData.teamMember ) {
      const simNameIsValid = isValidSimName( simName );
      const localeIsValid = isValidLocale( locale );
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