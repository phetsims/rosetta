// Copyright 2021, University of Colorado Boulder

import getCategorizedStringKeys from '../../getCategorizedStringKeys.js';
import getSimHtml from '../../getSimHtml.js';
import getSimNames from '../../getSimNames.js';
import getSimSpecificEnglishStringKeysAndStrings from '../../getSimSpecificEnglishStringKeysAndStrings.js';
import getSimUrl from '../../getSimUrl.js';
import getStringKeysWithRepoName from '../../getStringKeysWithRepoName.js';
import logger from '../../logger.js';

const simSpecificEnglishStringKeysAndStrings = async ( req, res ) => {
  try {
    const simUrl = getSimUrl( req.params.simName );
    const simHtml = await getSimHtml( simUrl );
    const stringKeysWithRepoName = getStringKeysWithRepoName( simHtml );
    const simNames = await getSimNames();
    const categorizedStringKeys = await getCategorizedStringKeys( req.params.simName, simNames, stringKeysWithRepoName );
    const simSpecificEnglishStringKeysAndStrings = await getSimSpecificEnglishStringKeysAndStrings( req.params.simName, categorizedStringKeys );
    logger.info( `responding with ${req.params.simName}'s sim-specific english string keys and strings` );
    res.json( simSpecificEnglishStringKeysAndStrings );
  }
  catch( e ) {
    logger.error( e );
  }
};

export { simSpecificEnglishStringKeysAndStrings as default };