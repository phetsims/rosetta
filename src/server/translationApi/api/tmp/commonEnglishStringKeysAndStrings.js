// Copyright 2021, University of Colorado Boulder

import getCategorizedStringKeys from '../../getCategorizedStringKeys.js';
import getSimMetadata from '../../getSimMetadata.js';
import getCommonEnglishStringKeysAndValues from '../../translationReport/getCommonEnglishStringKeysAndValues.js';
import getSimHtml from '../../getSimHtml.js';
import getSimNamesAndTitles from '../../getSimNamesAndTitles.js';
import getSimUrl from '../../getSimUrl.js';
import getStringKeysWithRepoName from '../../getStringKeysWithRepoName.js';
import logger from '../../logger.js';

const commonEnglishStringKeysAndStrings = async ( req, res ) => {
  try {
    const simUrl = getSimUrl( req.params.simName );
    const simHtml = await getSimHtml( simUrl );
    const stringKeysWithRepoName = getStringKeysWithRepoName( simHtml );
    const simMetadata = await getSimMetadata();
    const simNames = Object.keys( getSimNamesAndTitles( simMetadata ) );
    const categorizedStringKeys = await getCategorizedStringKeys( req.params.simName, simNames, stringKeysWithRepoName );
    const commonEnglishStringKeysAndStrings = await getCommonEnglishStringKeysAndValues( req.params.simName, simNames, categorizedStringKeys, stringKeysWithRepoName );
    logger.info( `responding ${req.params.simName}'s common english string keys and strings` );
    res.json( commonEnglishStringKeysAndStrings );
  }
  catch( e ) {
    logger.error( e );
  }
};

export default commonEnglishStringKeysAndStrings;