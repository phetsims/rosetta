// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function to get a sim's HTML.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
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
  logger.info( `getting sim HTML from ${simUrl}` );
  let simHtml;
  try {
    const simHtmlRes = await axios.get( simUrl );
    simHtml = simHtmlRes.data;
    logger.info( 'successfully retrieved sim HTML' );
  }
  catch( e ) {
    logger.error( e );
  }
  return simHtml;
};

export default getSimHtml;