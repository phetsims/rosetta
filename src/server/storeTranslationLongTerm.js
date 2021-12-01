// Copyright 2021, University of Colorado Boulder

import logger from './logger.js';

const storeTranslationLongTerm = translation => {
  logger.info( `storing ${translation.locale}/${translation.sim} translation in long-term storage` );
  logger.info( JSON.stringify( translation, null, 2 ) );
  logger.info( `stored ${translation.locale}/${translation.sim} translation in long-term storage` );
};

export { storeTranslationLongTerm as default };