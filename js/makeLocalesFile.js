// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that makes a file that contains all locales for which a phetsims has a translation file.
 *
 * @author Liam Mulhall
 */

// imports
const octonode = require( 'octonode' );
const getListOfLocales = require( './getListOfLocales' );

// TODO: Uncomment when done.
// const winston = require( 'winston' );

// constants
// TODO: Remove when done.
const ghClient = octonode.client( '901aec2964beaf71b74dd63ab598c9d45ebe5e44' );

// TODO: Uncomment when done.
// const CONFIG = global.config;
// const ghClient = octonode.client( CONFIG.githubPersonalAccessToken );

/**
 * Make a file that contains all locales for which a phetsims has a translation file.
 *
 * @param {string} repoName - the lowercase kebab-case repo name, e.g. acid-base-solutions
 */
const makeLocalesFile = async repoName => {
  const listOfLocales = await getListOfLocales( repoName );
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
    const makeFileRes = await ghRepo.updateContentsAsync(
      localesFileName,
      `automated commit from rosetta; making locales file for ${repoName}`,
      JSON.stringify( localesFileContents, null, 2 ),
      latestSha
    );

    // TODO: Remove this when done.
    console.log( `logging make file response for ${repoName}...` );
    console.log( makeFileRes );
  }
  catch( e ) {

    // TODO: Remove when done.
    console.error( e );

    // TODO: Uncomment when done.
    // winston.error( e );
  }
};

// TODO: Remove when done.
( async () => {
  const repo = 'area-model-algebra';
  await makeLocalesFile( repo );
} )();

module.exports = makeLocalesFile;