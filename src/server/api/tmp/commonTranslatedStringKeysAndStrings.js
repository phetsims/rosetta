// Copyright 2021, University of Colorado Boulder

import getCommonTranslatedStringKeysAndStrings from '../../getCommonTranslatedStringKeysAndStrings.js';
import logger from '../../logger.js';

const commonTranslatedStringKeysAndStrings = async ( req, res ) => {
  try {
    const commonTranslatedStringKeysAndStrings = await getCommonTranslatedStringKeysAndStrings( req.params.simOrLibName, req.params.locale );
    logger.info( `responding with ${req.params.locale}/${req.params.simOrLibName}'s common translated string keys and strings` );
    res.json( commonTranslatedStringKeysAndStrings );
  }
  catch( e ) {
    logger.error( e );
  }
};

export { commonTranslatedStringKeysAndStrings as default };