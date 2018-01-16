// Copyright 2015, University of Colorado Boulder

/**
 * A module that provides information about the PhET simulations that can be translated, such as which sims can be
 * translated, the URL of the version to use for testing, and so forth.
 *
 * @author John Blanco
 */

/* eslint-env node */
'use strict';

// modules
const RosettaConstants = require( './RosettaConstants' );
const fs = require( 'fs' );

// constants
const SIM_INFO_ARRAY = RosettaConstants.SIM_INFO_ARRAY;

/**
 * Get the simulation information given the project name.
 * @param {string} projectName - Project name for the simulation, same as the GitHub repo name.
 * @returns {Object} simulation information, see above for structure, null if no match found
 */
module.exports.getSimInfoByProjectName = function( projectName ) {

  // read file every time in case it has changed
  const simInfoArray = JSON.parse( fs.readFileSync( SIM_INFO_ARRAY, 'utf8' ) );
  for ( let i = 0; i < simInfoArray.length; i++ ) {
    if ( projectName === simInfoArray[ i ].projectName ) {
      return simInfoArray[ i ];
    }
  }
  return null;
};
