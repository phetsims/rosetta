// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function to get a sim's HTML.
 *
 * @author Liam Mulhall
 */

import axios from 'axios';
import logger from './logger.js';

/**
 * Return a sim's HTML. As of this writing, this function doesn't return the raw data, i.e. the sim's HTML. It returns
 * the object that contains the raw data along with other metadata.
 *
 * @param simUrl - the production URL for the sim
 * @returns {Promise<Object>} - the Axios response to the request for the sim's HTML
 */
const getSimHtml = async simUrl => {
  console.time( 'getSimHtml' );
  logger.info( `getting sim html from ${simUrl}` );
  let simHtml;
  try {
    simHtml = await axios.get( simUrl );
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( `got sim html from ${simUrl}; returning it` );
  console.timeEnd( 'getSimHtml' );
  return simHtml;
};

export default getSimHtml;