// Copyright 2021, University of Colorado Boulder

import logger from '../logger.js';
import prepareTranslationForLongTermStorage from '../prepareTranslationForLongTermStorage.js';
import storeTranslationLongTerm from '../storeTranslationLongTerm.js';

const submitTranslation = async ( req, res ) => {
  try {
    logger.info( `sending ${req.body.locale}/${req.body.sim} translation to be prepared for long-term storage` );
    const preparedTranslation = prepareTranslationForLongTermStorage( req.body );
    logger.info( `sending ${req.body.locale}/${req.body.sim} translation to be stored long-term` );
    await storeTranslationLongTerm( preparedTranslation );
    res.send( 'translation submitted' );
  }
  catch( e ) {
    logger.error( e );
  }
};

export default submitTranslation;