// Copyright 2022, University of Colorado Boulder

import getTranslatedAndUntranslatedSims from '../translationReport/getTranslatedAndUntranslatedSims.js';

const translatedAndUntranslatedSims = async ( req, res ) => {
  const translatedAndUntranslatedSims = await getTranslatedAndUntranslatedSims( req.params.locale );
  res.send( translatedAndUntranslatedSims );
};

export default translatedAndUntranslatedSims;