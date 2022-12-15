// Copyright 2022, University of Colorado Boulder

/**
 * Provide functionality for the test translation route.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getReplacementStringObject from '../getReplacementStringObject.js';
import getSimHtml from '../getSimHtml.js';
import getSimUrl from '../getSimUrl.js';
import getStringKeysWithRepoName from '../getStringKeysWithRepoName.js';
import logger from '../logger.js';

/**
 * Replace the sim's strings with the translator's inputted strings, and send the HTML to the client.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const testTranslation = async ( req, res ) => {
  try {
    const simHtml = await getSimHtml( getSimUrl( req.body.simName ) );
    const stringKeysWithRepoName = await getStringKeysWithRepoName( simHtml );
    const originalStringObject = JSON.stringify( stringKeysWithRepoName );
    const replacementStringObject = JSON.stringify( await getReplacementStringObject( stringKeysWithRepoName, req.body ) );
    const simHtmlWithTranslatedStrings = simHtml.replace( originalStringObject, replacementStringObject );
    logger.info( 'responding with sim html for translation test' );
    res.send( simHtmlWithTranslatedStrings );
  }
  catch( e ) {
    logger.error( e );
  }
};

export default testTranslation;