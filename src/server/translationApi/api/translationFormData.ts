// Copyright 2022, University of Colorado Boulder

/**
 * Provide functionality for the "translation form data" route in the Express server.  This function returns the data
 * needed to populate the translation form for a given sim and locale.
 *
 * @param req - Express request object
 * @param res - Express response object
 *
 * @author Liam Mulhall
 */

import { Request, Response } from 'express';
import getCategorizedStringKeys from '../getCategorizedStringKeys.js';
import getSimMetadata from '../getSimMetadata.js';
import getSimNamesAndTitles from '../getSimNamesAndTitles.js';
import getStringKeysUsedInSim from '../getStringKeysUsedInSim.js';
import getTranslationFormData from '../getTranslationFormData.js';
import isTeamMember from '../isTeamMember.js';
import logger from '../logger.js';

/**
 * API function. Send translation form data.
 *
 * @param req - Express request object
 * @param res - Express response object
 *
 * @returns A promise that resolves to void.
 */
const translationFormData = async ( req: Request, res: Response ): Promise<void> => {
  try {
    const simMetadata = await getSimMetadata();
    const simNames = Object.keys( getSimNamesAndTitles( simMetadata, isTeamMember( req ) ) );

    // Get a list of the string keys used in the sim, each with the repo name.
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
      req.query.userId ? Number( req.query.userId ) : 0
    );

    logger.info( `responding with ${req.params.locale}/${req.params.simName}'s translation form data` );
    res.header( 'Content-Type', 'application/json' );
    res.send( JSON.stringify( translationFormData, null, 2 ) );
  }
  catch( e ) {
    logger.error( e );
    res.status( 500 ).send( { error: 'An error occurred while processing the request.' } );
  }
};

export default translationFormData;