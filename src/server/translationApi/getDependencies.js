// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that gets dependencies for the specified simulation and version.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import privateConfig from '../../common/privateConfig.js';
import logger from './logger.js';

/**
 * Get the dependencies for the specified simulation and version.
 *
 * @param {string} simName
 * @param {string} version
 * @returns {Promise.<string>} - JSON data with dependencies
 */
const getDependencies = async ( simName, version ) => {

  let dependencies = 'error: unable to get dependencies';

  // Compose the URL where the dependencies should be.
  const url = `${privateConfig.SERVER_URL}/sims/html/${simName}/${version}/dependencies.json`;

  // Get the dependencies.
  logger.info( `getting dependencies from ${url}` );
  try {
    const dependenciesRes = await axios.get( url );
    const dependenciesJsonObject = dependenciesRes.data;
    dependencies = JSON.stringify( dependenciesJsonObject );
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( 'returning dependencies' );
  return dependencies;
};

export default getDependencies;