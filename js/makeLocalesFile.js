// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that makes a file that contains all locales for which a phetsims has a translation file.
 *
 * @author Liam Mulhall
 */

// imports
const octonode = require( 'octonode' );
const generateListOfLocales = require( './generateListOfLocales' );
const winston = require( 'winston' );

// constants
const CONFIG = global.config;
const ghClient = octonode.client( CONFIG.githubPersonalAccessToken );

/**
 * Make a file that contains all locales for which a phetsims has a translation file.
 *
 * @param {string} repoName - the lowercase kebab-case repo name, e.g. acid-base-solutions
 */
const makeLocalesFile = async repoName => {
  const listOfLocales = await generateListOfLocales( repoName );
  const localesFileContents = {
    locales: listOfLocales
  };
  const localesFileName = `${repoName}-locales.json`;
  try {
    const ghRepo = ghClient.repo( 'phetsims/babel' );

    // Get latest SHA.
    const commits = await ghRepo.commitsAsync();
    const latestSha = commits[ 0 ][ 0 ].sha;

    // Create(?) or update the file.
    await ghRepo.updateContentsAsync(
      localesFileName,
      `automated commit from rosetta; making locales file for ${repoName}`,
      JSON.stringify( localesFileContents, null, 2 ),
      latestSha
    );
  }
  catch( e ) {
    winston.error( e );
  }
};

module.exports = makeLocalesFile;