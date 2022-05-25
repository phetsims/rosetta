// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that stores a translation in long-term storage.
 *
 * @author Liam Mulhall
 */

import config from './config.js';
import deleteSavedTranslation from './deleteSavedTranslation.js';
import logger from './logger.js';
import { Octokit } from '@octokit/rest';
import { encode } from 'js-base64';

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
          const encodedTranslationFileContents = encode( JSON.stringify( contents[ repo ], null, 2 ) );

          // create an interface to long-term storage
          const octokit = new Octokit( {
            auth: config.GITHUB_PAT
          } );

          const translationFilePath = `${repo}/${repo}-strings_${preparedTranslation.locale}.json`;

          // if a translation file exists for the repo/locale we're dealing with, get its sha
          let translationFileSha = null;
          try {

            // todo: if config.BABEL_BRANCH = tests, get sha for file on tests branch
            // this is going to get the sha for the version of the file on the master branch
            const translationFileRes = await octokit.request(
              `GET /repos/phetsims/babel/contents/${translationFilePath}`
            );
            translationFileSha = translationFileRes.data.sha;
          }
          catch( e ) {
            if ( e.response.status === 404 ) {
              logger.info( `no translation file exists for ${repo}/${preparedTranslation.locale}` );
            }
            logger.error( e );
          }

          // todo: change params when done
          // save translation file contents to long-term storage
          const params = {
            owner: 'phetsims',
            repo: 'babel',
            branch: config.BABEL_BRANCH,
            path: translationFilePath,
            message: `automated commit from rosetta for sim/lib ${repo}, locale ${preparedTranslation.locale}`,
            content: encodedTranslationFileContents,
            committer: {
              name: 'phetdev',
              email: 'phetadmin@gmail.com'
            },
            author: {
              name: 'phetdev',
              email: 'phetadmin@gmail.com'
            }
          };
          if ( translationFileSha ) {
            params.sha = translationFileSha;
          }
          await octokit.repos.createOrUpdateFileContents( params );

          logger.info( `stored translation of strings in ${repo} long-term` );

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