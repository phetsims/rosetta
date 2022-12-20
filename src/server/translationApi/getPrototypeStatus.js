// Copyright 2022, University of Colorado Boulder

/**
 * Determine whether the sim is a prototype.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getSimMetadata from './getSimMetadata.js';

/**
 * Return a boolean that indicates whether the sim is a prototype.
 *
 * @param {String} simName - the simulation's name
 * @returns {Promise<boolean>} - whether the sim is a prototype
 */
const getPrototypeStatus = async simName => {
  let isPrototype = false;
  const simMetadata = await getSimMetadata();
  for ( const project of simMetadata.projects ) {
    for ( const sim of project.simulations ) {
      if ( simName === sim.name && sim.isPrototype ) {
        isPrototype = true;
      }
    }
  }
  return isPrototype;
};

export default getPrototypeStatus;