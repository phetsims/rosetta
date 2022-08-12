// Copyright 2022, University of Colorado Boulder

/**
 * Provide functionality for the test translation route.
 *
 * @author Liam Mulhall
 */

import getSimUrl from './getSimUrl.js';
import getSimHtml from './getSimHtml.js';

import logger from '../common/logger.js';

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
    logger.info( 'responding with sim html for translation test' );
    res.send( simHtmlRes.data );
  }
  catch( e ) {
    logger.error( e );
  }
};

export default testTranslation;