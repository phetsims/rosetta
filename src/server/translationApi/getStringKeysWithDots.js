// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that adds dots back to translation form data received from the client.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

/**
 * We strip the dots out of the string keys and replace them with strings before we send translation form
 * data to the client. We do this because the dots cause the client to think there are more deeply nested
 * keys when there aren't. For example, a string key like
 *
 * (A)
 * "acid-base-solutions.title": {
 *    "value": "Acid-Base Solutions"
 * }
 *
 * would confuse the client. The client would think that it's looking for something like
 *
 * (B)
 * "acid-base-solutions": {
 *    "title": {
 *      "value": "Acid-Base Solutions"
 *    }
 * }
 *
 * but (B) is obviously wrong. We made (A) look like
 *
 * (C)
 * "acid-base-solutions_DOT_title": {
 *    "value": "Acid-Base Solutions"
 * }
 *
 * and we sent the translation form data to the client as in (C). Now that we have the translation form data back
 * from the client, we transform the data from (C) back to (A).
 *
 * @param {Object} data - either translation.translationFormData.simSpecific or translation.translationFormData.common
 * @returns {Object} - same data, but with dots instead of _DOT_
 */
const getStringKeysWithDots = data => {
  const newData = {};
  for ( const stringKey of Object.keys( data ) ) {
    const stringKeyWithDots = stringKey.replaceAll( '_DOT_', '.' );
    newData[ stringKeyWithDots ] = data[ stringKey ];
  }
  return newData;
};

export default getStringKeysWithDots;