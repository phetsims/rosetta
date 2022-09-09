// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that gets a list of locales for which a phetsims repo has a translation file.
 *
 * @author Liam Mulhall
 */

// imports
const octonode = require( 'octonode' );
const winston = require( 'winston' );

// constants
const CONFIG = global.config;
const ghClient = octonode.client( CONFIG.githubPersonalAccessToken );

/**
 * Return the list of locales for which a phetsims repo has a translation file.
 *
 * @param {string} repoName - the lowercase kebab-case repo name, e.g. acid-base-solutions
 * @returns {string[]} listOfLocales - the list of locales for which a phetsims repo has a translation file
 */
const generateListOfLocales = async repoName => {
  let listOfLocales = [];
  try {
    const ghRepo = ghClient.repo( 'phetsims/babel' );

    // Get latest SHA.
    const commits = await ghRepo.commitsAsync();
    const latestSha = commits[ 0 ][ 0 ].sha;

    // Get tree.
    const tree = await ghRepo.treeAsync( latestSha, true ); // true makes this recursive
    const treeTree = tree[ 0 ].tree;

    // Get list of files in the repoName subdirectory of phetsims/babel.
    for ( const treeItem of treeTree ) {

      // If the repoName is not exactly the path, but part of the path...
      if ( treeItem.path !== repoName && treeItem.path.includes( repoName ) ) {

        // Paths should look like acid-base-solutions/acid-base-solutions-strings_am.json.

        // Extract {locale}.json.
        const locale = treeItem.path.replace( `${repoName}/${repoName}-strings_`, '' );

        // Add just the locale to the list.
        listOfLocales.push( locale.replace( '.json', '' ) );
      }
    }
  }
  catch( e ) {
    winston.error( e );
    listOfLocales = [ 'error: unable to get list of locales' ];
  }
  return listOfLocales;
};

module.exports = generateListOfLocales;