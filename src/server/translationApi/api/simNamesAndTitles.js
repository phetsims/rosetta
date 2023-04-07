// Copyright 2022, University of Colorado Boulder

/**
 * Define functionality for the sim names and titles route.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getSimMetadata from '../getSimMetadata.js';
import getSimNamesAndTitles from '../getSimNamesAndTitles.js';
import logger from '../logger.js';

/**
 * Respond with an object whose keys are sim names and whose values are sim titles.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const simNamesAndTitles = async ( req, res ) => {
  logger.info( 'responding with sim names and titles' );

  // TODO: Cast the query parameter to a boolean. See https://github.com/phetsims/rosetta/issues/391.
  res.json( getSimNamesAndTitles( await getSimMetadata(), req.query.isTeamMember ) );
};

export default simNamesAndTitles;