// Copyright 2021, University of Colorado Boulder

import getCategorizedStringKeys from '../../getCategorizedStringKeys.js';
import getSimSpecificEnglishStringKeysAndStrings from '../../getSimSpecificEnglishStringKeysAndStrings.js';
import logger from '../../logger.js';

const simSpecificEnglishStringKeysAndStrings = async ( req, res ) => {
  try {
    const categorizedStringKeys = await getCategorizedStringKeys( req.params.simName );
    const simSpecificEnglishStringKeysAndStrings = await getSimSpecificEnglishStringKeysAndStrings( req.params.simName, categorizedStringKeys );
    logger.info( `responding with ${req.params.simName}'s sim-specific english string keys and strings` );
    res.json( simSpecificEnglishStringKeysAndStrings );
  }
  catch( e ) {
    logger.error( e );
  }
};

export { simSpecificEnglishStringKeysAndStrings as default };