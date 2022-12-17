// Copyright 2022, University of Colorado Boulder

/**
 * Provide functionality for the translated and untranslated sims route.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getTranslatedAndUntranslatedSims from '../translationReport/getTranslatedAndUntranslatedSims.js';

/**
 * Respond with an object containing an array of translated sims and an array of untranslated sims.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const translatedAndUntranslatedSims = async ( req, res ) => {
  const translatedAndUntranslatedSims = await getTranslatedAndUntranslatedSims(
    req.params.locale,
    req.query.isTeamMember
  );
  res.send( translatedAndUntranslatedSims );
};

export default translatedAndUntranslatedSims;