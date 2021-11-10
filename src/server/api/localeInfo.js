// Copyright 2021, University of Colorado Boulder

// server modules
const getLocaleInfo = require( '../getLocaleInfo.js' );
const logger = require( '../logger.js' );

const localeInfo = async ( req, res ) => {
  try {
    const localeInfo = await getLocaleInfo();
    res.json( localeInfo );
  }
  catch( e ) {
    logger.error( e );
  }
};

module.exports = localeInfo;