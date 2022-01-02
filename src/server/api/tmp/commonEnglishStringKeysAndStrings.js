// Copyright 2021, University of Colorado Boulder

import getCategorizedStringKeys from '../../getCategorizedStringKeys.js';
import getCommonEnglishStringKeysAndStrings from '../../getCommonEnglishStringKeysAndStrings.js';
import getSimHtml from '../../getSimHtml.js';
import getSimNames from '../../getSimNames.js';
import getSimUrl from '../../getSimUrl.js';
import getStringKeysWithRepoName from '../../getStringKeysWithRepoName.js';
import logger from '../../logger.js';

const commonEnglishStringKeysAndStrings = async ( req, res ) => {
  try {
    const simUrl = getSimUrl( req.params.simName );
    const simHtml = await getSimHtml( simUrl );
    const stringKeysWithRepoName = getStringKeysWithRepoName( simHtml );
    const simNames = await getSimNames();
    const categorizedStringKeys = await getCategorizedStringKeys( req.params.simName, simNames, stringKeysWithRepoName );
    const commonEnglishStringKeysAndStrings = await getCommonEnglishStringKeysAndStrings( req.params.simName, categorizedStringKeys );
    logger.info( `responding ${req.params.simName}'s common english string keys and strings` );
    res.json( commonEnglishStringKeysAndStrings );
  }
  catch( e ) {
    logger.error( e );
  }
};

export default commonEnglishStringKeysAndStrings;