// Copyright 2021, University of Colorado Boulder

// packages
const axios = require( 'axios' );

// server modules
const config = require( 'config.js' );
const logger = require( 'logger.js' );

const getLocaleInfo = async () => {
  let localeInfo;
  try {
    const localeInfoUrl = `${config.GITHUB_URL}/chipper/master/data/localeInfo.json`;
    localeInfo = await axios.get( localeInfoUrl );
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( 'got locale info; returning it' );
  return localeInfo;
};

module.exports = getLocaleInfo;