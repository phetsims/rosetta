// Copyright 2022, University of Colorado Boulder

/**
 * Return minutes elapsed between two timestamps.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

/**
 * Return number of minutes elapsed between the first time and the second time.
 *
 * @param millisecondsA - chronologically first time
 * @param millisecondsB - chronologically second time
 * @returns {Number} - number of minutes elapsed between timestamps
 */
const getMinutesElapsed = ( millisecondsA, millisecondsB ) => {
  return ( millisecondsB - millisecondsA ) / 1000 / 60;
};

export default getMinutesElapsed;