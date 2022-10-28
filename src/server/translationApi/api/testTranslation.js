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
 * todo: update this when done
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {} - todo: add type when done
 */
const testTranslation = async ( req, res ) => {
  try {
    const simHtml = await getSimHtml( getSimUrl( req.body.simName ) );

    // TODO: We should be able to call this with just simHtml. Fix getStringKeysWithRepoName.
    const originalStringObject = JSON.stringify( getStringKeysWithRepoName( simHtml ) );
    const replacementStringObject = JSON.stringify( await getReplacementStringObject( simHtml, req.body ) );
    const simHtmlWithTranslatedStrings = simHtml.replace( originalStringObject, replacementStringObject );
    logger.info( 'responding with sim html for translation test' );
    res.send( simHtmlWithTranslatedStrings );
  }
  catch( e ) {
    logger.error( e );
  }
};

export default testTranslation;