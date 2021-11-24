// Copyright 2021, University of Colorado Boulder

import config from './config.js';
import logger from './logger.js';

const getTranslatedStringFile = ( simName, locale ) => {
  logger.verbose( `getting ${simName}/${locale}'s translated string file url` );
  logger.verbose( `got ${simName}/${locale}'s translated string file url; returning it` );
  return `${config.GITHUB_URL}/babel/${config.BABEL_BRANCH}/${simName}/${simName}-strings_${locale}.json`;
};

export { getTranslatedStringFile as default };