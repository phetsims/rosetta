// Copyright 2022, University of Colorado Boulder

/**
 * Provide functionality for the translation form data API route.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getCategorizedStringKeys from '../getCategorizedStringKeys.js';
import getSimHtml from '../getSimHtml.js';
import getSimMetadata from '../getSimMetadata.js';
import getSimNamesAndTitles from '../getSimNamesAndTitles.js';
import getSimUrl from '../getSimUrl.js';
import getStringKeysWithRepoName from '../getStringKeysWithRepoName.js';
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
    const simUrl = getSimUrl( req.params.simName );
    const simHtml = await getSimHtml( simUrl );

    // Here, we want the REPO_NAME/stringKey array rather than the object.
    const stringKeysWithRepoName = Object.keys( getStringKeysWithRepoName( simHtml ) );
    const categorizedStringKeys = await getCategorizedStringKeys( req.params.simName, stringKeysWithRepoName );
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