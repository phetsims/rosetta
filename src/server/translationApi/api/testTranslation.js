// Copyright 2022, University of Colorado Boulder

/**
 * Provide functionality for the test translation route.
 *
 * @author Liam Mulhall
 */

import getReplacementStringObject from '../getReplacementStringObject.js';
import getSimHtml from '../getSimHtml.js';
import getSimUrl from '../getSimUrl.js';
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
    const simHtmlRes = await getSimHtml( getSimUrl( req.body.simName ) );
    const simHtml = simHtmlRes.data;

    // TODO: We should be able to call this with just simHtml. Fix getStringKeysWithRepoName.
    const replacementStringObject = getReplacementStringObject( simHtmlRes, req.body.translationFormData );
    console.log( JSON.stringify( replacementStringObject, null, 4 ) );
    logger.info( 'responding with sim html for translation test' );
    res.send( simHtml );
  }
  catch( e ) {
    logger.error( e );
  }
};

export default testTranslation;