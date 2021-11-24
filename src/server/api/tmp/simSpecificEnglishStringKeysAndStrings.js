// Copyright 2021, University of Colorado Boulder

import getSimSpecificEnglishStringKeysAndStrings from '../../getSimSpecificEnglishStringKeysAndStrings.js';
import logger from '../../logger.js';

const simSpecificEnglishStringKeysAndStrings = async ( req, res ) => {
  try {
    const simSpecificEnglishStringKeysAndStrings = await getSimSpecificEnglishStringKeysAndStrings( req.params.simName );
    logger.info( `responding with ${req.params.simName}'s sim-specific english string keys and strings` );
    res.json( simSpecificEnglishStringKeysAndStrings );
  }
  catch( e ) {
    logger.error( e );
  }
};

export { simSpecificEnglishStringKeysAndStrings as default };