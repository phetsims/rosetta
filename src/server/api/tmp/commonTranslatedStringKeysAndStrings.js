// Copyright 2021, University of Colorado Boulder

import getCommonTranslatedStringKeysAndStrings from '../../getCommonTranslatedStringKeysAndStrings.js';
import logger from '../../logger.js';

const commonTranslatedStringKeysAndStrings = async ( req, res ) => {
  try {
    const commonTranslatedStringKeysAndStrings = await getCommonTranslatedStringKeysAndStrings( req.params.simOrLibraryName, req.params.locale );
    logger.info( `responding with common translated string keys and strings for ${req.params.simOrLibraryName} in ${req.params.locale}` );
    res.json( commonTranslatedStringKeysAndStrings );
  }
  catch( e ) {
    logger.error( e );
  }
};

export { commonTranslatedStringKeysAndStrings as default };