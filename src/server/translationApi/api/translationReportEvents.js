// Copyright 2022, University of Colorado Boulder

/**
 * Send translation report events via server sent events. Each event is an object containing data needed to populate
 * a translation report table row.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getSimMetadata from '../getSimMetadata.js';
import getSimNamesAndTitles from '../getSimNamesAndTitles.js';
import logger from '../logger.js';
import getTranslatedAndUntranslatedSims from '../translationReport/getTranslatedAndUntranslatedSims.js';
import getTranslationReportObject from '../translationReport/getTranslationReportObject.js';
import { reportObjectCache } from '../translationApi.js';

/**
 * Set up an "event stream" (google on server sent events) of translation report objects used to populate rows of the
 * translation report table. We enable the user of this route to specify the number of sims they want report objects
 * for. Specifying the number of report objects is useful for debugging and testing.
 *
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
  const simNamesAndTitles = getSimNamesAndTitles( simMetadata, req.query.isTeamMember );
  const translatedAndUntranslatedSims = await getTranslatedAndUntranslatedSims(
    req.params.locale,
    req.query.isTeamMember
  );
  let simNames = translatedAndUntranslatedSims.translated;
  if ( req.query.wantsUntranslated === 'true' ) {
    simNames = translatedAndUntranslatedSims.untranslated;
  }

  // This is the default. In production, this param should be set to null.
  if ( !req.params.numberOfEvents ) {

    // If number of events hasn't been specified, send events for every sim.
    for ( const sim of simNames ) {
      let translationReportObject = reportObjectCache.getObject( req.params.locale, sim );
      if ( !translationReportObject ) {

        // Cache miss; get the report object the hard way.
        translationReportObject = await getTranslationReportObject(
          sim,
          req.params.locale,
          simNames,
          simNamesAndTitles[ sim ],
          req.query.wantsUntranslated
        );
        reportObjectCache.setObject( req.params.locale, sim, translationReportObject, Date.now() );
      }
      res.write( `data: ${JSON.stringify( translationReportObject )}\n\n` );
    }
  }
  else {

    // Otherwise, send events for the specified number of sims.
    // This is used for debugging.
    for ( let i = 0; i < req.params.numberOfEvents; i++ ) {
      const simName = simNames[ i ];
      let translationReportObject = reportObjectCache.getObject( req.params.locale, simName );
      if ( !translationReportObject ) {
        translationReportObject = await getTranslationReportObject(
          simName,
          req.params.locale,
          simNames,
          simNamesAndTitles[ simName ],
          req.query.wantsUntranslated
        );
        reportObjectCache.setObject( req.params.locale, simName, translationReportObject, Date.now() );
      }
      res.write( `data: ${JSON.stringify( translationReportObject )}\n\n` );
    }
  }
  res.write( 'data: closed\n\n' );
  res.end();

  req.on( 'close', () => {
    logger.info( 'closed translation reports events' );
  } );
};

export default translationReportEvents;