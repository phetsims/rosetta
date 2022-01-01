// Copyright 2021, University of Colorado Boulder

import getCategorizedStringKeys from '../../getCategorizedStringKeys.js';
import getCommonTranslatedStringKeysAndStrings from '../../getCommonTranslatedStringKeysAndStrings.js';
import logger from '../../logger.js';

const commonTranslatedStringKeysAndStrings = async ( req, res ) => {
  try {
    const categorizedStringKeys = await getCategorizedStringKeys( req.params.simOrLibName );
    const commonTranslatedStringKeysAndStrings = await getCommonTranslatedStringKeysAndStrings( req.params.simOrLibName, req.params.locale, categorizedStringKeys );
    logger.info( `responding with ${req.params.locale}/${req.params.simOrLibName}'s common translated string keys and strings` );
    res.json( commonTranslatedStringKeysAndStrings );
  }
  catch( e ) {
    logger.error( e );
  }
};

export { commonTranslatedStringKeysAndStrings as default };