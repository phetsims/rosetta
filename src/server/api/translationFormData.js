// Copyright 2021, University of Colorado Boulder

import getTranslationFormData from '../getTranslationFormData.js';
import logger from '../logger.js';

const translationFormData = async ( req, res ) => {
  try {
    const translationFormData = await getTranslationFormData( req.params.simName, req.params.locale );
    logger.info( `responding with ${req.params.simName}/${req.params.locale}'s translation form data` );
    res.header( 'Content-Type', 'application/json' );
    res.send( JSON.stringify( translationFormData, null, 2 ) );
  }
  catch( e ) {
    logger.error( e );
  }
};

export { translationFormData as default };