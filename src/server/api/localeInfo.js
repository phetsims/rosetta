// Copyright 2021, University of Colorado Boulder

import getLocaleInfo from '../getLocaleInfo.js';
import logger from '../logger.js';

const localeInfo = async ( req, res ) => {
  try {
    const localeInfo = await getLocaleInfo();
    logger.info( 'responding with locale info' );
    res.json( localeInfo );
  }
  catch( e ) {
    logger.error( e );
  }
};

export default localeInfo;