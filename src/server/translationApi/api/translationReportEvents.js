// Copyright 2022, University of Colorado Boulder

/**
 * Send translation report events via server sent events. Each event is an object containing data needed to populate
 * a translation report table row.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { SIMS_FOR_SHORT_REPORT } from '../../../common/constants.js';
import privateConfig from '../../../common/privateConfig.js';
import publicConfig from '../../../common/publicConfig.js';
import getSimMetadata from '../getSimMetadata.js';
import getSimNamesAndTitles from '../getSimNamesAndTitles.js';
import isTeamMember from '../isTeamMember.js';
import logger from '../logger.js';
import { reportObjectCache } from '../translationApi.js';
import getTranslatedAndUntranslatedSims from '../translationReport/getTranslatedAndUntranslatedSims.js';
import getTranslationReportObject from '../translationReport/getTranslationReportObject.js';

/**
 * Set up an "event stream" (google on server sent events) of translation report objects used to populate rows of the
 * translation report table.
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const translationReportEvents = async ( req, res ) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache'
  };

  res.writeHead( 200, headers );

  const simMetadata = await getSimMetadata();
  const userIsTeamMember = isTeamMember( req );
  const simNamesAndTitles = getSimNamesAndTitles( simMetadata, userIsTeamMember );
  const translatedAndUntranslatedSims = await getTranslatedAndUntranslatedSims( req.params.locale, userIsTeamMember );
  let simNames = req.query.wantsUntranslated === 'true' ?
                 translatedAndUntranslatedSims.untranslated :
                 translatedAndUntranslatedSims.translated;

  // If the server is running in the development environment and the configuration is set for a short report, reduce
  // the number of simulations for which translation report objects are obtained.  This is useful for debugging, since
  // getting all the data takes several minutes and also can cause us to exceed some GitHub file read limitations.
  if ( publicConfig.ENVIRONMENT === 'development' && privateConfig.SHORT_REPORT ) {
    simNames = simNames.filter( simName => SIMS_FOR_SHORT_REPORT.includes( simName ) );
  }

  // Loop through the list of sim names, sending events for each.
  for ( const sim of simNames ) {
    let translationReportObject = reportObjectCache.getObject( req.params.locale, sim );
    if ( !translationReportObject ) {

      // Cache miss; get the report object the hard way.
      translationReportObject = await getTranslationReportObject(
        sim,
        req.params.locale,
        simNames,
        simNamesAndTitles[ sim ],
        req.query.wantsUntranslated === 'true'
      );
      reportObjectCache.setObject( req.params.locale, sim, translationReportObject, Date.now() );
    }
    res.write( `data: ${JSON.stringify( translationReportObject )}\n\n` );
  }
  res.write( 'data: closed\n\n' );
  res.end();

  req.on( 'close', () => {
    logger.info( 'closed translation reports events' );
  } );
};

export default translationReportEvents;