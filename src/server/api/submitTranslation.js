// Copyright 2021, University of Colorado Boulder

import logger from '../logger.js';
import storeTranslationLongTerm from '../storeTranslationLongTerm.js';

const submitTranslation = ( req, res ) => {
  try {
    logger.info( `preparing ${req.body.locale}/${req.body.sim} translation for long-term storage` );
    storeTranslationLongTerm( req.body );
    res.send( 'translation submitted' );
  }
  catch( e ) {
    logger.error( e );
  }
};

export { submitTranslation as default };