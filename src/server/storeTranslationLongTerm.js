// Copyright 2021, University of Colorado Boulder

import config from './config.js';
import { encode } from 'js-base64';
import logger from './logger.js';
import { Octokit } from '@octokit/rest';

const storeTranslationLongTerm = async translation => {
  logger.info( `storing ${translation.locale}/${translation.sim} translation in long-term storage` );
  logger.info( JSON.stringify( translation, null, 2 ) );
  try {

    // make the translation a string and use base 64 encoding
    const encodedTranslation = encode( JSON.stringify( translation, null, 2 ) );

    // push the translation to github
    const octokit = new Octokit( {
      auth: config.LIAM_BABEL_PAT
    } );
    const { data } = await octokit.repos.createOrUpdateFileContents( {
      owner: 'liam-mulhall',
      repo: 'babel',
      path: 'test-translation-2.json',
      message: 'test',
      content: encodedTranslation,
      committer: {
        name: 'Liam',
        email: 'dummy@dummy.com'
      },
      author: {
        name: 'Liam',
        email: 'dummy@dummy.com'
      }
    } );
    logger.info( data );
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( `stored ${translation.locale}/${translation.sim} translation in long-term storage` );
};

export default storeTranslationLongTerm;