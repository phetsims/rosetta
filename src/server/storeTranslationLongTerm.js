// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that stores a translation in long-term storage.
 *
 * @author Liam Mulhall
 */

import axios from 'axios';
import config from './config.js';
import deleteSavedTranslation from './deleteSavedTranslation.js';
import getBlobSha from './getBlobSha.js';
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

    // create an interface to long-term storage
    const octokit = new Octokit( {
      auth: config.GITHUB_PAT
    } );

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

          const translationFilePath = `${repo}/${repo}-strings_${preparedTranslation.locale}.json`;

          // if a translation file exists for the repo/locale we're dealing with, get its sha
          let translationFileSha = null;
          try {
            const rawGithubFileUrl = `${config.GITHUB_URL}/babel/${config.BABEL_BRANCH}/${translationFilePath}`;
            logger.info( `trying to get ${rawGithubFileUrl}` );
            const rawGithubFileRes = await axios.get( rawGithubFileUrl );
            if ( rawGithubFileRes.status === 200 ) {

              // the file exists in babel, so let's get its sha
              translationFileSha = await getBlobSha( translationFilePath );
            }
          }
          catch( e ) {
            if ( e.status === 404 ) {
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
              name: config.COMMITTER_NAME,
              email: config.COMMITTER_EMAIL
            },
            author: {
              name: config.COMMITTER_NAME,
              email: config.COMMITTER_EMAIL
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