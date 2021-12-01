// Copyright 2021, University of Colorado Boulder

import logger from './logger.js';

const storeTranslationLongTerm = translation => {
  logger.info( JSON.stringify( translation, null, 2 ) );
};

export { storeTranslationLongTerm as default };