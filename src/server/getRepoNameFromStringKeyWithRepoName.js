// Copyright 2021, University of Colorado Boulder

import logger from './logger.js';

const getRepoNameFromStringKeyWithRepoName = stringKeyWithRepoName => {
  const repoNameRegEx = /.*(?=\/)/;
  const repoName = stringKeyWithRepoName.match( repoNameRegEx );
  const lowercaseKebabRepoName = repoName[ 0 ].toLowerCase()
    .replaceAll( '_', '-' );
  logger.verbose( `returning lowercase-kebab repo name from ${stringKeyWithRepoName}` );
  return lowercaseKebabRepoName;
};

export { getRepoNameFromStringKeyWithRepoName as default };