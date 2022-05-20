// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that stores a translation in long-term storage.
 *
 * @author Liam Mulhall
 */

import config from './config.js';
import logger from './logger.js';
import { Octokit } from '@octokit/rest';
import { encode } from 'js-base64';

/**
 * Save the translation to long-term storage.
 *
 * @param {Object} preparedTranslation - exact translation file contents for each repo in a translation
 */
const storeTranslationLongTerm = async preparedTranslation => {

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
          auth: config.LIAM_BABEL_PAT
        } );

        const translationFilePath = `${repo}/${repo}-strings_${preparedTranslation.locale}.json`;

        // if a translation file exists for the repo/locale we're dealing with, get its sha
        let translationFileSha = null;
        try {

          // todo: change 'liam-mulhall' to phetsims when done
          const translationFileRes = await octokit.request(
            `GET /repos/liam-mulhall/babel/contents/${translationFilePath}`
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
          owner: 'liam-mulhall',
          repo: 'babel',
          path: translationFilePath,
          message: 'test',
          content: encodedTranslationFileContents,
          committer: {
            name: 'Liam',
            email: 'dummy@dummy.com'
          },
          author: {
            name: 'Liam',
            email: 'dummy@dummy.com'
          }
        };
        if ( translationFileSha ) {
          params.sha = translationFileSha;
        }
        await octokit.repos.createOrUpdateFileContents( params );

        logger.info( `stored translation of strings in ${repo} long-term` );
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
};

export default storeTranslationLongTerm;