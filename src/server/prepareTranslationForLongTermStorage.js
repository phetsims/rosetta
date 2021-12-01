// Copyright 2021, University of Colorado Boulder

import logger from './logger.js';

const prepareTranslationForLongTermStorage = translation => {
  logger.info( `adding dummy field to ${translation.locale}/${translation.sim}` );
  translation.dummyField = 'dummy';
  logger.info( `added dummy field to ${translation.locale}/${translation.sim}; returning translation` );
  return translation;
};

export { prepareTranslationForLongTermStorage as default };