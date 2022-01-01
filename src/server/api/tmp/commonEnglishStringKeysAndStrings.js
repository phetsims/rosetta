// Copyright 2021, University of Colorado Boulder

import getCategorizedStringKeys from '../../getCategorizedStringKeys.js';
import getCommonEnglishStringKeysAndStrings from '../../getCommonEnglishStringKeysAndStrings.js';
import logger from '../../logger.js';

const commonEnglishStringKeysAndStrings = async ( req, res ) => {
  try {
    const categorizedStringKeys = await getCategorizedStringKeys( req.params.simName );
    const commonEnglishStringKeysAndStrings = await getCommonEnglishStringKeysAndStrings( req.params.simName, categorizedStringKeys );
    logger.info( `responding ${req.params.simName}'s common english string keys and strings` );
    res.json( commonEnglishStringKeysAndStrings );
  }
  catch( e ) {
    logger.error( e );
  }
};

export { commonEnglishStringKeysAndStrings as default };