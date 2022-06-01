// Copyright 2022, University of Colorado Boulder
/* eslint-disable consistent-return */

import { exec } from 'node:child_process';
import config from './config.js';
import logger from './logger.js';

/**
 * Export a function that gets the SHA for a given file or directory.
 *
 * @author Liam Mulhall
 */

const getShaString = array => {
  for ( const item of array ) {
    if ( item.length === 40 ) {
      const hexRegex = /[0-9A-Fa-f]{6}/g;
      if ( hexRegex.test( item ) ) {
        return item;
      }
      else {
        return 'error';
      }
    }
  }
};

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
      const result = stdout.split( '\n' );
      console.log( result );
      const sha = getShaString( result );
      if ( sha !== 'error' ) {
        resolve( sha );
      }
      else {
        reject( sha );
      }
    } );
  } );
};

export default getBlobSha;