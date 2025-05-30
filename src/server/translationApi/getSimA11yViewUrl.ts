// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a utility function to get a sim's A11y View URL to test accessible strings.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getSimBaseUrl from './getSimBaseUrl.js';
import logger from './logger.js';

/**
 * Return a sim's URL.
 *
 * @param simName - sim name
 * @returns - sim url
 */
const getSimA11yViewUrl = ( simName: string ): string => {
  const simUrl = `${getSimBaseUrl( simName )}/${simName}_a11y_view.html`;
  logger.info( `url requested for ${simName}, returning ${simUrl}` );
  return simUrl;
};

export default getSimA11yViewUrl;