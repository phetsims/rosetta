// Copyright 2021, University of Colorado Boulder

import config from './config.js';
import logger from './logger.js';

const getSimUrl = simName => {
  logger.info( 'returning sim url' );
  return `${config.SERVER_URL}/sims/html/${simName}/latest/${simName}_en.html`;
};

export { getSimUrl as default };