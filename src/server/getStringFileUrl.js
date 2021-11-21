// Copyright 2021, University of Colorado Boulder

import config from './config.js';
import logger from './logger.js';

const getStringFileUrl = repoName => {
  logger.verbose( `returning ${repoName}'s string file url` );
  return `${config.GITHUB_URL}/${repoName}/master/${repoName}-strings_en.json`;
};

export { getStringFileUrl as default };