// Copyright 2022, University of Colorado Boulder

/**
 * Create a configuration object to be used by the React code. We set this up here
 * so that we can use the normal Rosetta config file to influence what is returned
 * in this object.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import config from '../../../common/config.js';

/**
 * Return a config object for the client-side code.
 *
 * @param {Object} req - the Express request object
 * @param {Object} res - the Express response object
 */
const clientConfig = ( req, res ) => {

  // We need to be able to dynamically set the website user data URL because
  // it's undergoing flux, and the new version will be different depending on
  // whether you're on the dev server or the prod server.

  // Production future: 'https://phet-direct.colorado.edu/user/check-login'
  // Production current: 'https://phet.colorado.edu/services/check-login'
  // Dev current: 'https://phet-direct-dev.colorado.edu/user/check-login'
  res.json( {
    websiteUserDataUrl: config.WEBSITE_USER_DATA_URL
  } );
};

export default clientConfig;