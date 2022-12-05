// Copyright 2022, University of Colorado Boulder

import config from '../../../common/config.js';

const clientConfig = ( req, res ) => {

  // Production future: 'https://phet-direct.colorado.edu/user/check-login'
  // Production current: 'https://phet.colorado.edu/services/check-login'
  // Dev current: 'https://phet-direct-dev.colorado.edu/user/check-login'
  res.json( {
    websiteUserDataUrl: config.WEBSITE_USER_DATA_URL
  } );
};

export default clientConfig;