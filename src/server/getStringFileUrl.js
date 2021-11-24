// Copyright 2021, University of Colorado Boulder

import config from './config.js';
import logger from './logger.js';

const getStringFileUrl = repoName => {
  logger.verbose( `getting ${repoName}'s string file url` );
  logger.verbose( `got ${repoName}'s string file url; returning it` );
  return `${config.GITHUB_URL}/${repoName}/master/${repoName}-strings_en.json`;
};

export { getStringFileUrl as default };