// Copyright 2021, University of Colorado Boulder

import getCategorizedStringKeys from '../../getCategorizedStringKeys.js';
import getSimMetadata from '../../getSimMetadata.js';
import getSimHtml from '../../getSimHtml.js';
import getSimNamesAndTitles from '../../getSimNamesAndTitles.js';
import getSimSpecificTranslatedStringKeysAndValues from '../../translationReport/getSimSpecificTranslatedStringKeysAndValues.js';
import getSimUrl from '../../getSimUrl.js';
import getStringKeysWithRepoName from '../../getStringKeysWithRepoName.js';
import logger from '../../logger.js';

const simSpecificTranslatedStringKeysAndStrings = async ( req, res ) => {
  try {
    const simUrl = getSimUrl( req.params.simName );
    const simHtml = await getSimHtml( simUrl );
    const stringKeysWithRepoName = getStringKeysWithRepoName( simHtml );
    const simMetadata = await getSimMetadata();
    const simNames = Object.keys( getSimNamesAndTitles( simMetadata ) );
    const categorizedStringKeys = await getCategorizedStringKeys( req.params.simName, simNames, stringKeysWithRepoName );
    const simSpecificTranslatedStringKeysAndStrings = await getSimSpecificTranslatedStringKeysAndValues( req.params.simName, req.params.locale, categorizedStringKeys );
    logger.info( `responding with ${req.params.locale}/${req.params.simName}'s sim-specific translated string keys and strings` );
    res.json( simSpecificTranslatedStringKeysAndStrings );
  }
  catch( e ) {
    logger.error( e );
  }
};

export default simSpecificTranslatedStringKeysAndStrings;