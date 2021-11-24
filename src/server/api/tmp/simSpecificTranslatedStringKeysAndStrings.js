// Copyright 2021, University of Colorado Boulder

import getSimSpecificTranslatedStringKeysAndStrings from '../../getSimSpecificTranslatedStringKeysAndStrings.js';
import logger from '../../logger.js';

const simSpecificTranslatedStringKeysAndStrings = async ( req, res ) => {
  try {
    const simSpecificTranslatedStringKeysAndStrings = await getSimSpecificTranslatedStringKeysAndStrings( req.params.simName, req.params.locale );
    logger.info( `responding with ${req.params.locale}/${req.params.simName}'s sim-specific translated string keys and strings` );
    res.json( simSpecificTranslatedStringKeysAndStrings );
  }
  catch( e ) {
    logger.error( e );
  }
};

export { simSpecificTranslatedStringKeysAndStrings as default };