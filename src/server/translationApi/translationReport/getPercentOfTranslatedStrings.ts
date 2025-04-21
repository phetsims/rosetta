// Copyright 2023, University of Colorado Boulder
/**
 * Helper function that gets percentage value from 0 to 100 of translated strings.  This handles a few special cases
 * that are specific to how Rosetta's reports work.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 * @author John Blanco (PhET Interactive Simulations)
 */

import logger from '../logger.js';

/**
 * Helper function that gets percentage value from 0 to 100 of translated strings.  This handles a few special cases
 * that are specific to how Rosetta's reports work.
 *
 * @param numberOfTranslatedStrings - number of translated strings
 * @param totalNumberOfStrings - total number of strings
 * @returns - percentage of translated strings, or null if either number is null
 */
const getPercentOfTranslatedStrings = (
  numberOfTranslatedStrings: number,
  totalNumberOfStrings: number
): number | null => {
  let percent: number | null = null;
  if ( numberOfTranslatedStrings !== null && totalNumberOfStrings !== null ) {

    if ( numberOfTranslatedStrings > totalNumberOfStrings ) {
      logger.error( 'The number of translated strings should never exceed the total.' );
      percent = 100;
    }
    if ( numberOfTranslatedStrings === totalNumberOfStrings ) {

      // If the totals are equal, return 100 percent.  This handles the case where there are none of either, which would
      // be a divide-by-zero error (NaN in JS) if we simply did the math.
      percent = 100;
    }
    else {
      percent = Math.floor( ( numberOfTranslatedStrings / totalNumberOfStrings ) * 100 );
    }
  }

  return percent;
};

export default getPercentOfTranslatedStrings;