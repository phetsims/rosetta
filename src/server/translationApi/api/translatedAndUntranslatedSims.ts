// Copyright 2022, University of Colorado Boulder

/**
 * Provide functionality for the "get translated and untranslated sims" route.  This adapts the standard Express server
 * callback format to a function to get the translated and untranslated sims.
 *
 * @param req - Express request object
 * @param res - Express response object
 *
 * @author Liam Mulhall
 * @author John Blanco (PhET Interactive Simulations)
 */

import { Request, Response } from 'express';
import isTeamMember from '../isTeamMember.js';
import getTranslatedAndUntranslatedSims from '../translationReport/getTranslatedAndUntranslatedSims.js';

const translatedAndUntranslatedSims = async ( req: Request, res: Response ): Promise<void> => {
  const translatedAndUntranslatedSims = await getTranslatedAndUntranslatedSims( req.params.locale, isTeamMember( req ) );
  res.send( translatedAndUntranslatedSims );
};

export default translatedAndUntranslatedSims;