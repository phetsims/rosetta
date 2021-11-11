// Copyright 2021, University of Colorado Boulder

import logger from './logger.js';

const getStringKeyFromStringKeyWithRepoName = stringKeyWithRepoName => {
  logger.verbose( `returning string key from ${stringKeyWithRepoName}` );
  return stringKeyWithRepoName.match( /\/(.*)/ )[ 0 ].replace( '/', '' );
};

export { getStringKeyFromStringKeyWithRepoName as default };