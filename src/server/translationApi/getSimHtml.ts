// Copyright 2021-2022, University of Colorado Boulder

/**
 * Get an HTML file for a sim.  This gets the live version from the PhET website.
 *
 * @param simUrl - the production URL for the sim
 * @returns A promise that resolves to the sim's HTML as a string or and empty string if an error occurs.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 * @author John Blanco (PhET Interactive Simulations)
 */

import logger from './logger.js';

const getSimHtml = async ( simUrl: string ): Promise<string> => {

  logger.info( `getting sim HTML from ${simUrl}` );
  let simHtml = '';

  try {
    const response = await fetch( simUrl );
    if ( response.ok ) {
      simHtml = await response.text();
      logger.info( `successfully retrieved HTML file from ${simUrl}` );
    }
    else {
      logger.error( `Error retrieving sim HTML from ${simUrl}: ${response.status} ${response.statusText}` );
    }
  }
  catch( e ) {
    logger.error( `Error while retrieving sim HTML from ${simUrl}: ${e}` );
  }

  return simHtml;
};

export default getSimHtml;