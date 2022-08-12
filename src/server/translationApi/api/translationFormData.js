// Copyright 2021, University of Colorado Boulder

/**
 * Provide functionality for the translation form data API route.
 *
 * @author Liam Mulhall
 */

import getCategorizedStringKeys from '../getCategorizedStringKeys.js';
import getSimHtml from '../getSimHtml.js';
import getSimNames from '../getSimNames.js';
import getSimUrl from '../getSimUrl.js';
import getStringKeysWithRepoName from '../getStringKeysWithRepoName.js';
import getTranslationFormData from '../getTranslationFormData.js';
import logger from '../../common/logger.js';

/**
 * API function. Send translation form data.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<String>} - translation form data
 */
const translationFormData = async ( req, res ) => {
  try {
    const simNames = await getSimNames();
    const simUrl = getSimUrl( req.params.simName );
    const simHtml = await getSimHtml( simUrl );
    const stringKeysWithRepoName = getStringKeysWithRepoName( simHtml );
    const categorizedStringKeys = await getCategorizedStringKeys( req.params.simName, simNames, stringKeysWithRepoName );
    const translationFormData = await getTranslationFormData(
      req.params.simName,
      req.params.locale,
      simNames,
      stringKeysWithRepoName,
      categorizedStringKeys
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