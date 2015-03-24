// Copyright 2002-2015, University of Colorado Boulder

/**
 * A module that provides information about the PhET simulations that can be translated, such as which sims can be
 * translated, the URL of the version to use for testing, and so forth.
 *
 * TODO: This module is essentially hardcoded as of late January 2015, but at some point should become dynamic,
 * meaning that it will generate the sim list and URLs in some standard way based on the list of active simulations
 * already maintained in GitHub (see chipper/active-sims).  The reason that it is hardcoded now is that most sims
 * haven't been published with the code that supports the needed approach for query parameter string loading.
 *
 * @author John Blanco
 */
'use strict'; // TODO: Does this work, and is it needed?

// Keep data in simInfoArray.json in alphabetical order
var simInfoArray = require( '../data/simInfoArray.json' );

module.exports.simInfoArray = simInfoArray;

/**
 * Get the simulation information given the project name.
 * @param {string} projectName - Project name for the simulation, same as the GitHub repo name.
 * @returns {object} simulation information, see above for structure, null if no match found
 */
module.exports.getSimInfoByProjectName = function( projectName ) {
  for ( var i = 0; i < simInfoArray.length; i++ ) {
    if ( projectName === simInfoArray[ i ].projectName ) {
      return simInfoArray[ i ]
    }
  }
  return null;
};
