// Copyright 2023, University of Colorado Boulder

import { Octokit } from '@octokit/rest';
import privateConfig from '../../common/privateConfig.js';
import logger from './logger.js';

const octokit = new Octokit( { auth: privateConfig.GITHUB_PAT } );

/**
 * Get a string file for a given repo and locale.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

/**
 * Return the contents of the string file.
 *
 * @param {String} simOrLibRepo - repository where the strings come from
 * @returns {Promise<Object|null>} - string file
 */
const getStringFile = async simOrLibRepo => {

  let stringFile = null;

  const owner = 'phetsims';
  const repo = simOrLibRepo;
  const path = `${simOrLibRepo}-strings_en.json`;
  const ref = 'master';

  try {
    const response = await octokit.repos.getContent( {
      owner: owner,
      repo: repo,
      path: path,
      ref: ref
    } );

    const content = Buffer.from( response.data.content, 'base64' ).toString( 'utf-8' );
    stringFile = JSON.parse( content );
  }
  catch( e ) {
    logger.error( e );
  }

  return stringFile;
};

export default getStringFile;