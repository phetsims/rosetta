// Copyright 2021, University of Colorado Boulder

import getSimNames from '../getSimNames.js';
import logger from '../logger.js';

const simNames = async ( req, res ) => {
  try {
    const simNames = await getSimNames();
    logger.info( 'responding with sim names' );
    res.json( simNames );
  }
  catch( e ) {
    logger.error( e );
  }
};

export default simNames;