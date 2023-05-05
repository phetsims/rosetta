// Copyright 2023, University of Colorado Boulder

import logger from '../logger.js';
import { reportObjectCache } from '../translationApi.js';

const flushReportObject = ( req, res ) => {
  logger.info( `attempting to flush report object for ${req.params.locale} ${req.params.sim}` );
  const flushed = reportObjectCache.flushObject( req.params.locale, req.params.sim );
  if ( flushed ) {
    res.send( 'success' );
  }
  else {
    res.send( 'failure' );
  }
};

export default flushReportObject;