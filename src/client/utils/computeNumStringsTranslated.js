// Copyright 2022, University of Colorado Boulder

/**
 * Compute the number of strings translated in the translation form. To be presented to user
 * before they submit their translation.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

const computeNumStringsTranslated = translationValues => {
  const simSpecific = translationValues.simSpecific;
  let numSimSpecific = 0;
  for ( const stringKey of Object.keys( simSpecific ) ) {
    if ( simSpecific[ stringKey ].translated !== '' ) {
      numSimSpecific++;
    }
  }
  return numSimSpecific;
};

export default computeNumStringsTranslated;