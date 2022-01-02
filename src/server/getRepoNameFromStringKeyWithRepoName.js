// Copyright 2021, University of Colorado Boulder

import logger from './logger.js';

const getRepoNameFromStringKeyWithRepoName = stringKeyWithRepoName => {
  logger.verbose( `getting lowercase-kebab repo name from ${stringKeyWithRepoName}` );
  const repoNameRegEx = /.*(?=\/)/;
  const repoName = stringKeyWithRepoName.match( repoNameRegEx );
  const lowercaseKebabRepoName = repoName[ 0 ].toLowerCase()
    .replaceAll( '_', '-' );
  logger.verbose( `got lowercase-kebab repo name from ${stringKeyWithRepoName}; returning it` );
  return lowercaseKebabRepoName;
};

export default getRepoNameFromStringKeyWithRepoName;