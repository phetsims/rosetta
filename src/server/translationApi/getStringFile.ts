// Copyright 2023, University of Colorado Boulder

/**
 * Get a string file for a given repo and locale.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { Octokit } from '@octokit/rest';
import privateConfig from '../../common/privateConfig.js';
import { TranslationDataForRepo } from './api/StorableTranslationData.js';
import logger from './logger.js';

const octokit = new Octokit( { auth: privateConfig.GITHUB_PAT } );

/**
 * Return the contents of the string file.
 *
 * @param simOrLibRepo - repository where the strings come from
 * @param ref - branch or SHA of commit to get the string file from
 * @returns string file
 */
const getStringFile = async (
  simOrLibRepo: string,
  ref = 'main'
): Promise<TranslationDataForRepo> => {
  let stringFile = null;
  try {
    const response = await octokit.repos.getContent( {
      owner: 'phetsims',
      repo: simOrLibRepo,
      path: `${simOrLibRepo}-strings_en.json`,
      ref: ref
    } );
    if ( 'content' in response.data && response.data.content ) {
      const content = Buffer.from( response.data.content, 'base64' ).toString( 'utf-8' );
      stringFile = JSON.parse( content );
    }
  }
  catch( e ) {
    logger.error( e );
  }
  return stringFile;
};

export default getStringFile;