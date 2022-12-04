// Copyright 2022, University of Colorado Boulder

import getSimMetadata from '../getSimMetadata.js';
import getSimNamesAndTitles from '../getSimNamesAndTitles.js';
import logger from '../logger.js';
import getTranslationReportObject from '../translationReport/getTranslationReportObject.js';
import { reportObjectCache } from '../translationApi.js';

const translationReportEvents = async ( req, res ) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache'
  };

  res.writeHead( 200, headers );

  const simMetadata = await getSimMetadata();
  const simNamesAndTitles = getSimNamesAndTitles( simMetadata );
  const simNames = Object.keys( simNamesAndTitles );
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
          simNamesAndTitles[ sim ]
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
      let translationReportObject = reportObjectCache.getObject( req.params.locale, simNames[ i ] );
      if ( !translationReportObject ) {
        translationReportObject = await getTranslationReportObject(
          simNames[ i ],
          req.params.locale,
          simNames,
          simNamesAndTitles[ simNames[ i ] ]
        );
        reportObjectCache.setObject( req.params.locale, simNames[ i ], translationReportObject, Date.now() );
      }
      res.write( `data: ${JSON.stringify( translationReportObject )}\n\n` );
    }
  }
  res.write( 'data: closed\n\n' );

  req.on( 'close', () => {
    logger.info( 'closed translation reports events' );
  } );
};

export default translationReportEvents;