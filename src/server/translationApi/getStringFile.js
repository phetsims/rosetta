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
 * @param {String} locale - ISO 639-1 locale code, e.g. es for Spanish
 * @returns {Promise<Object|null>} - string file
 */
const getStringFile = async ( simOrLibRepo, locale ) => {

  let stringFile = null;

  const owner = 'phetsims';
  const repo = simOrLibRepo;
  const path = `${simOrLibRepo}-strings_${locale}.json`;
  const ref = privateConfig.BABEL_BRANCH;

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