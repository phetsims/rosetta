// Copyright 2022, University of Colorado Boulder

/**
 * Provide functionality for the test translation route.  See function header below for more information.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 * @author John Blanco (PhET Interactive Simulations)
 */

import getReplacementStringObject from '../getReplacementStringObject.js';
import getSimHtml from '../getSimHtml.js';
import getSimUrl from '../getSimUrl.js';
import getStringKeysUsedInSim from '../getStringKeysUsedInSim.js';
import logger from '../logger.js';

/**
 * Replace the sim's strings with those entered by a translator and send the resulting HTML to the client.
 * @param {Object} req - Express request object, contains the sim name and translation info.
 * @param {Object} res - Express response object
 */
const testTranslation = async ( req, res ) => {

  const simName = req.body.simName;

  // return value
  let simHtmlWithTranslatedStrings;

  try {

    logger.info( `testing translation for sim: ${simName}` );

    // Get the set of keys and English values for the strings that are used in the sim.
    const stringKeysAndEnglishValues = await getStringKeysUsedInSim( simName );

    if ( Object.keys( stringKeysAndEnglishValues ).length > 0 ) {

      // Get an object with the string keys and any translated strings that the user has provided.  If the user hasn't
      // provided a value for a given key the English value will be left unchanged.
      const stringKeysAndTestValues = await getReplacementStringObject( stringKeysAndEnglishValues, req.body );

      // Get the currently published HTML for the simulation that is being tested.
      const simHtml = await getSimHtml( getSimUrl( simName ) );

      // Replace the assignment statement in the sim code that defines the string values with the translated strings.
      const regex = /^\s*window\.phet\.chipper\.strings\s*=\s*.*$/m;
      simHtmlWithTranslatedStrings = simHtml.replace(
        regex,
        `window.phet.chipper.strings = {"en":${JSON.stringify( stringKeysAndTestValues )}};`
      );

      logger.info( 'responding with sim HTML for translation test' );
    }
    else {

      // No string map info found, return an error message that will be displayed to the user.
      simHtmlWithTranslatedStrings = `Error: unable to get string map file sim: ${simName}`;
      logger.error( 'no string map info found' );
    }
  }
  catch( e ) {
    simHtmlWithTranslatedStrings = `Error testing translation for ${simName}: ${e}`;
    logger.error( e );
  }

  res.send( simHtmlWithTranslatedStrings );
};

export default testTranslation;