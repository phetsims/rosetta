// Copyright 2021, University of Colorado Boulder

import config from './config.js';
import logger from './logger.js';

const getTranslatedStringFile = ( simName, locale ) => {
  logger.verbose( `returning ${simName}/${locale}'s translated string file url` );
  return `${config.GITHUB_URL}/babel/${config.BABEL_BRANCH}/${simName}/${simName}-strings_${locale}.json`;
};

export { getTranslatedStringFile as default };