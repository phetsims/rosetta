// Copyright 2023, University of Colorado Boulder

import { Octokit } from '@octokit/rest';
import privateConfig from '../../common/privateConfig.js';
import logger from './logger.js';

/**
 * Define a class that can be used to interface with long-term storage.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

const OWNER = 'phetsims';
const REPO = 'babel';

class LongTermStorage {

  constructor() {

    // Create the Octokit instance. Octokit is a library that
    // allows us to interface with the GitHub API.
    this.octokit = new Octokit( { auth: privateConfig.GITHUB_PAT } );
  }

  /**
   * Get the path to a translation file in the phetsims/babel repo.
   *
   * @param {String} simOrLibRepo - repository where the strings come from
   * @param {String} locale - ISO 639-1 locale code, e.g. es for Spanish
   * @returns {String} - path to the translation file
   * @private
   */
  _getFilePath( simOrLibRepo, locale ) {
    return `${simOrLibRepo}/${simOrLibRepo}-strings_${locale}.json`;
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
    logger.info( `attempting to get translation for ${simOrLibRepo}/${locale} from long-term storage` );
    let translatedStringFileContents = {};
    try {
      const response = await this.octokit.repos.getContent( {
        owner: OWNER,
        repo: REPO,
        path: this._getFilePath( simOrLibRepo, locale ),
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

  /**
   * Get the SHA of a translation file in the phetsims/babel repo.
   *
   * @param {String} simOrLibRepo - repository where the strings come from
   * @param {String} locale - ISO 639-1 locale code, e.g. es for Spanish
   * @param {String} branch - phetsims/babel branch to get the translation from
   * @returns {Promise<String>} - the SHA of the translation file
   * @private
   */
  async _getGitShaOfFile( simOrLibRepo, locale, branch = null ) {
    let sha = '';
    try {
      const response = await this.octokit.repos.getContent( {
        owner: OWNER,
        repo: REPO,
        path: this._getFilePath( simOrLibRepo, locale ),
        ref: branch ? branch : privateConfig.BABEL_BRANCH
      } );
      sha = response.data.sha;
    }
    catch( e ) {
      if ( Number( e.response.status ) === 404 ) {
        logger.warn( `no translation file for ${simOrLibRepo} in ${locale}` );
      }
      else {
        logger.error( e );
      }
    }
    return sha;
  }

  /**
   * Store a translation in long-term storage.
   *
   * @param {String} simOrLibRepo - repository where the strings come from
   * @param {String} locale - ISO 639-1 locale code, e.g. es for Spanish
   * @param {Object} translationFileContents - translation file contents
   * @param {String} branch - phetsims/babel branch to store the translation in
   * @returns {Promise<Boolean>} - whether the translation was stored
   * @public
   */
  async store( simOrLibRepo, locale, translationFileContents, branch = null ) {
    let stored = false;
    const emptyTranslationFileContents = Object.keys( translationFileContents ).length === 0;
    if ( privateConfig.PERFORM_STRING_COMMITS && !emptyTranslationFileContents ) {
      logger.info( `attempting to store translation for ${simOrLibRepo}/${locale} in long-term storage` );
      const sha = await this._getGitShaOfFile( simOrLibRepo, locale, branch );
      try {
        const response = await this.octokit.repos.createOrUpdateFileContents( {
          owner: OWNER,
          repo: REPO,
          path: this._getFilePath( simOrLibRepo, locale ),
          branch: branch ? branch : privateConfig.BABEL_BRANCH,
          message: `automated commit from rosetta for sim/lib ${simOrLibRepo}, locale ${locale}`,
          content: Buffer.from(
            JSON.stringify( translationFileContents, null, 2 ), 'utf-8'
          ).toString( 'base64' ),
          sha: sha === '' ? undefined : sha // SHA is required to update a file, not required to create a file.
        } );
        if ( response.status >= 200 && response.status < 300 ) {
          logger.info( `stored translation for ${simOrLibRepo}/${locale} in long-term storage` );
          logger.verbose( `commit sha: ${response.data.commit.sha}` );
          stored = true;
        }
      }
      catch( e ) {
        logger.error( e );
      }
    }
    else {
      if ( !privateConfig.PERFORM_STRING_COMMITS ) {
        logger.warn( 'config option for committing to long-term storage is false' );
      }
      if ( emptyTranslationFileContents ) {
        logger.warn( `translation file contents for ${simOrLibRepo}/${locale} are empty` );
      }
      logger.warn( 'translation will not be stored in long-term storage' );
    }
    return stored;
  }
}

export default LongTermStorage;