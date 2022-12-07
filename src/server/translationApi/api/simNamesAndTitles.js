// Copyright 2022, University of Colorado Boulder

/**
 * Define functionality for the sim names and titles route.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getSimMetadata from '../getSimMetadata.js';
import getSimNamesAndTitles from '../getSimNamesAndTitles.js';

/**
 * Respond with an object whose keys are sim names and whose values are sim titles.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const simNamesAndTitles = async ( req, res ) => {
  res.json( getSimNamesAndTitles( await getSimMetadata() ) );
};

export default simNamesAndTitles;