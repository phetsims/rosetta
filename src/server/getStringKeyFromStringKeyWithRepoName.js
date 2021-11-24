// Copyright 2021, University of Colorado Boulder

import logger from './logger.js';

const getStringKeyFromStringKeyWithRepoName = stringKeyWithRepoName => {
  logger.verbose( `getting string key from ${stringKeyWithRepoName}` );
  logger.verbose( `got string key from ${stringKeyWithRepoName}; returning it` );
  return stringKeyWithRepoName.match( /\/(.*)/ )[ 0 ].replace( '/', '' );
};

export { getStringKeyFromStringKeyWithRepoName as default };