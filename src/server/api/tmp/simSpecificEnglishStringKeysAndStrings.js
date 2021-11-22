// Copyright 2021, University of Colorado Boulder

import getSimSpecificEnglishStringKeysAndStrings from '../../getSimSpecificEnglishStringKeysAndStrings.js';
import logger from '../../logger.js';

const simSpecificEnglishStringKeysAndStrings = async ( req, res ) => {
  try {
    const simSpecificEnglishStringKeysAndStrings = await getSimSpecificEnglishStringKeysAndStrings( req.params.simName );
    logger.info( `responding with sim-specific english string keys and strings for ${req.params.simName}` );
    res.json( simSpecificEnglishStringKeysAndStrings );
  }
  catch( e ) {
    logger.error( e );
  }
};

export { simSpecificEnglishStringKeysAndStrings as default };