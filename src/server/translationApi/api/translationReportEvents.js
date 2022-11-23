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
  const simNames = Object.keys( getSimNamesAndTitles( simMetadata ) );
  for ( const sim of simNames ) {
    const translationReportObject = await getTranslationReportObject( sim, req.body.locale, simNames );
    res.write( `data: ${JSON.stringify( translationReportObject )}\n\n` );
  }

  req.on( 'close', () => {
    logger.info( 'closed translation reports events' );
  } );
};

export default translationReportEvents;