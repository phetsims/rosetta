// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that gets dependencies for the specified simulation and version.
 *
 * @author Liam Mulhall
 */

import axios from 'axios';
import config from '../../common/config.js';
import logger from './logger.js';

/**
 * Get the dependencies for the specified simulation and version.
 *
 * @param {string} simName
 * @param {string} version
 * @returns {Promise.<string>} - JSON data with dependencies
 */
const getDependencies = async ( simName, version ) => {

  let ret;

  // Compose the URL where the dependencies should be.
  const url = `${config.SERVER_URL}/sims/html/${simName}/${version}/dependencies.json`;

  // Get the dependencies.
  logger.info( `getting dependencies from ${url}` );
  try {
    const dependencies = await axios.get( url );
    const dependenciesJsonObject = dependencies.data;
    ret = JSON.stringify( dependenciesJsonObject );
  }
  catch( e ) {
    ret = 'error: unable to get dependencies';
    logger.error( e );
  }
  logger.info( 'returning dependencies' );
  return ret;
};

export default getDependencies;