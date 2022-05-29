// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that stores a translation in long-term storage.
 *
 * @author Liam Mulhall
 */

import config from './config.js';
import deleteSavedTranslation from './deleteSavedTranslation.js';
import github from 'octonode';
import logger from './logger.js';

// import { encode } from 'js-base64';

/**
 * Save the translation to long-term storage.
 *
 * @param {Object} preparedTranslation - exact translation file contents for each repo in a translation
 */
const storeTranslationLongTerm = async preparedTranslation => {

  if ( config.PERFORM_STRING_COMMITS ) {

    logger.info( `storing translation of ${preparedTranslation.locale}/${preparedTranslation.simName} long-term` );

    // iterate through each repo in the prepared translation and save its translation file contents to long-term storage
    const contents = preparedTranslation.translationFileContents;
    for ( const repo of Object.keys( contents ) ) {

      // check to see if the object is not empty (i.e. strings were translated in repo)
      if ( Object.keys( contents[ repo ] ).length !== 0 ) {
        try {

          logger.info( `storing translation of strings in ${repo} long-term` );

          // make the translation file contents a string and use base 64 encoding
          // const encodedTranslationFileContents = encode( JSON.stringify( contents[ repo ], null, 2 ) );

          // create an interface to github
          const githubClient = github.client( config.GITHUB_PAT );

          // create interface to long-term storage
          const longTermStorageRepo = githubClient.repo( 'phetsims/babel' );

          const translationFilePath = `${repo}/${repo}-strings_${preparedTranslation.locale}.json`;

          const contentsOfFilePath = await longTermStorageRepo.contentsAsync( translationFilePath, config.BABEL_BRANCH );

          // todo: remove when done
          console.log( contentsOfFilePath, null, 2 );

          logger.info( `stored translation of strings in ${repo} long-term` );

          // delete any extant saved translation(s) with the given user id / sim name / locale
          await deleteSavedTranslation( {
            userId: preparedTranslation.userId,
            simName: preparedTranslation.simName,
            locale: preparedTranslation.locale
          } );
        }
        catch( e ) {
          logger.error( e );
        }
      }

      // strings were not translated in repo
      else {
        logger.info( `no strings translated in ${repo}; not storing long-term` );
      }
    }

    logger.info( `stored translation of ${preparedTranslation.locale}/${preparedTranslation.simName} long-term` );
  }
  else {
    logger.info( 'rosetta not configured to perform string commits; check your config file' );
    logger.info( `not storing translation of ${preparedTranslation.locale}/${preparedTranslation.simName} long-term` );
  }

};

export default storeTranslationLongTerm;