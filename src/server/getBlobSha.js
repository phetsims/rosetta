// Copyright 2022, University of Colorado Boulder
/* eslint-disable consistent-return */

import config from './config.js';
import getShaFromArray from './getShaFromArray.js';
import logger from './logger.js';
import { exec } from 'node:child_process';

/**
 * Export a function that gets the SHA for a given file or directory.
 *
 * @author Liam Mulhall
 */


/**
 * Return the SHA of the blob of the file or directory given.
 *
 * @param {String} fileOrDir - the file or directory whose blob's SHA we want
 * @returns {Promise<String>} - the SHA of the blob for the given file or directory
 */
const getBlobSha = fileOrDir => {

  logger.info( `getting blob sha for ${fileOrDir}` );

  const changeDir = 'cd ../babel';
  const updateBabel = 'git fetch && git pull';
  const switchBranch = `git switch ${config.BABEL_BRANCH}`;
  const getHashObject = `git hash-object ${fileOrDir}`;

  return new Promise( ( resolve, reject ) => {
    exec( changeDir
          + ' && '
          + updateBabel
          + ' && '
          + switchBranch
          + ' && '
          + getHashObject, ( e, stdout, stderr ) => {
      if ( e ) {
        logger.error( e );
        return reject( e );
      }
      if ( stderr ) {
        logger.warn( stderr );
      }
      const outputArray = stdout.split( '\n' );
      const sha = getShaFromArray( outputArray );
      if ( sha === 'no sha' ) {
        reject( sha );
      }
      else {
        resolve( sha );
      }
    } );
  } );
};

export default getBlobSha;