// Copyright 2021, University of Colorado Boulder

import axios from 'axios';
import logger from './logger.js';

const getSimHtml = async simUrl => {
  logger.info( `getting sim html from ${simUrl}` );
  let simHtml;
  try {
    simHtml = await axios.get( simUrl );
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( `got sim html from ${simUrl}; returning it` );
  return simHtml;
};

export { getSimHtml as default };