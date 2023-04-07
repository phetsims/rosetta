// Copyright 2023, University of Colorado Boulder

import { Octokit } from '@octokit/rest';
import privateConfig from '../../common/privateConfig.js';
import logger from './logger.js';

/**
 * Define a class that can be used to interface with long-term storage.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

class LongTermStorage {

  constructor() {

    // Create the Octokit instance. Octokit is a library that
    // allows us to interface with the GitHub API.
    this.octokit = new Octokit( { auth: privateConfig.GITHUB_PAT } );
  }

  /**
   * Get a translation for a given repo and locale if it exists.
   *
   * @param {String} simOrLibRepo - repository where the strings come from
   * @param {String} locale - ISO 639-1 locale code, e.g. es for Spanish
   * @param {String|null} branch - phetsims/babel branch to get the translation from
   * @returns {Promise<Object>} - translation file contents for the given repo and locale if it exists or empty object
   * @public
   */
  async get( simOrLibRepo, locale, branch = null ) {
    let translatedStringFileContents = {};
    try {
      const response = await this.octokit.repos.getContent( {
        owner: 'phetsims',
        repo: 'babel',
        path: `${simOrLibRepo}/${simOrLibRepo}-strings_${locale}.json`,
        ref: branch ? branch : privateConfig.BABEL_BRANCH
      } );
      const content = Buffer.from( response.data.content, 'base64' ).toString( 'utf-8' );
      translatedStringFileContents = JSON.parse( content );
    }
    catch( e ) {
      if ( Number( e.response.status ) === 404 ) {
        logger.warn( `no translation file for ${simOrLibRepo} in ${locale}` );
      }
      else {
        logger.error( e );
      }
    }
    return translatedStringFileContents;
  }
}

export default LongTermStorage;