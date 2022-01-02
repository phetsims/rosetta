// Copyright 2021, University of Colorado Boulder

import config from './config.js';
import logger from './logger.js';

const getSimUrl = simName => {
  logger.info( `getting ${simName}'s sim url` );
  logger.info( `got ${simName}'s sim url; returning it` );
  return `${config.SERVER_URL}/sims/html/${simName}/latest/${simName}_en.html`;
};

export default getSimUrl;