// Copyright 2022, University of Colorado Boulder

import getSimMetadata from '../getSimMetadata.js';
import getSimNamesAndTitles from '../getSimNamesAndTitles.js';
import logger from '../logger.js';
import getTranslationReportObject from '../translationReport/getTranslationReportObject.js';

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
  console.log( `req.params.numberOfEvents =========================== ${req.params.numberOfEvents}` );
  if ( !req.params.numberOfEvents ) {

    // If number of events hasn't been specified, send events for every sim.
    for ( const sim of simNames ) {
      const translationReportObject = await getTranslationReportObject( sim, req.params.locale, simNames, simNamesAndTitles[ sim ] );
      res.write( `data: ${JSON.stringify( translationReportObject )}\n\n` );
    }
  }
  else {

    // Otherwise, send events for the specified number of sims.
    for ( let i = 0; i < req.params.numberOfEvents; i++ ) {
      const translationReportObject = await getTranslationReportObject( simNames[ i ], req.params.locale, simNames, simNamesAndTitles[ simNames[ i ] ] );
      res.write( `data: ${JSON.stringify( translationReportObject )}\n\n` );
    }
  }
  res.write( 'data: closed\n\n' );

  req.on( 'close', () => {
    logger.info( 'closed translation reports events' );
  } );
};

export default translationReportEvents;