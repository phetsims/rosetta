// Copyright 2022, University of Colorado Boulder

/**
 * Provide functionality for the translation form data API route.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getCategorizedStringKeys from '../getCategorizedStringKeys.js';
import getSimMetadata from '../getSimMetadata.js';
import getSimNamesAndTitles from '../getSimNamesAndTitles.js';
import getStringKeysUsedInSim from '../getStringKeysUsedInSim.js';
import getTranslationFormData from '../getTranslationFormData.js';
import logger from '../logger.js';

/**
 * API function. Send translation form data.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<String>} - translation form data
 */
const translationFormData = async ( req, res ) => {
  try {
    const simMetadata = await getSimMetadata();
    const simNames = Object.keys( getSimNamesAndTitles( simMetadata ) );

    // Get a list of the string keys used in the sim, each with the repo name.  An example of what one of these will
    // look like is 'SUN/a11y.numberSpinnerRoleDescription'.
    const stringKeysWithRepoName = Object.keys( await getStringKeysUsedInSim( req.params.simName ) );

    // Sort the strings into the categories needed by the translation form.
    const categorizedStringKeys = await getCategorizedStringKeys( req.params.simName, stringKeysWithRepoName );

    // Get the data needed to populate the translation form.
    const translationFormData = await getTranslationFormData(
      req.params.simName,
      req.params.locale,
      simNames,
      stringKeysWithRepoName,
      categorizedStringKeys,
      req.query.userId
    );
    logger.info( `responding with ${req.params.locale}/${req.params.simName}'s translation form data` );
    res.header( 'Content-Type', 'application/json' );
    res.send( JSON.stringify( translationFormData, null, 2 ) );
  }
  catch( e ) {
    logger.error( e );
  }
};

export default translationFormData;