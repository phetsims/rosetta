// Copyright 2022, University of Colorado Boulder

/**
 * Get the SHA of the most recently published (latest) version of a sim.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getDependencies from './getDependencies.js';

/**
 * Return the SHA of the most recently published (latest) version of the supplied sim.
 *
 * @param {string} simName - lowercase kebab case sim name, e.g. acid-base-solutions
 * @returns {Promise<string>}
 */
const getLatestSimSha = async simName => {
  const depsString = await getDependencies( simName, 'latest' );
  const depsObject = JSON.parse( depsString );
  return depsObject[ simName ].sha;
};

export default getLatestSimSha;