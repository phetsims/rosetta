// Copyright 2021, University of Colorado Boulder

import logger from '../logger.js';
import storeTranslationShortTerm from '../storeTranslationShortTerm.js';

const saveTranslation = async ( req, res ) => {
  try {
    logger.info( `saving ${req.body.locale}/${req.body.sim} translation to short-term storage` );
    await storeTranslationShortTerm( req.body );
    res.send( 'translation saved' );
  }
  catch( e ) {
    logger.error( e );
  }
};

export default saveTranslation;