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
    try {

      // make the translation file contents a string and use base 64 encoding
      const encodedTranslationFileContents = encode( JSON.stringify( contents[ repo ], null, 2 ) );

      // create an interface to long-term storage
      const octokit = new Octokit( {
        auth: config.LIAM_BABEL_PAT
      } );

      // save translation file contents to long-term storage
      const { data } = await octokit.repos.createOrUpdateFileContents( {
        owner: 'liam-mulhall',
        repo: 'babel',
        path: `test-${preparedTranslation.simName}-${preparedTranslation.locale}-${repo}-translation.json`,
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
      } );
      logger.error( data );
    }
    catch( e ) {
      logger.error( e );
    }
  }

  // todo: finish this when you're done preparing the translation for long-term storage
  // logger.info( `storing ${translation.locale}/${translation.sim} translation in long-term storage` );
  // logger.info( JSON.stringify( translation, null, 2 ) );
  // try {
  //
  //   // make the translation a string and use base 64 encoding
  //   const encodedTranslation = encode( JSON.stringify( translation, null, 2 ) );
  //
  //   // push the translation to long-term storage
  //   const octokit = new Octokit( {
  //     auth: config.LIAM_BABEL_PAT
  //   } );
  //   const { data } = await octokit.repos.createOrUpdateFileContents( {
  //     owner: 'liam-mulhall',
  //     repo: 'babel',
  //     path: 'test-translation-2.json',
  //     message: 'test',
  //     content: encodedTranslation,
  //     committer: {
  //       name: 'Liam',
  //       email: 'dummy@dummy.com'
  //     },
  //     author: {
  //       name: 'Liam',
  //       email: 'dummy@dummy.com'
  //     }
  //   } );
  //   logger.info( data );
  // }
  // catch( e ) {
  //   logger.error( e );
  // }
  // logger.info( `stored ${translation.locale}/${translation.sim} translation in long-term storage` );

  logger.info( `stored translation of ${preparedTranslation.locale}/${preparedTranslation.simName} long-term` );
};

export default storeTranslationLongTerm;