// Copyright 2002-2015, University of Colorado Boulder

/**
 * A module that provides information about the PhET simulations that can be translated, such as which sims can be
 * translated, the URL of the version to use for testing, and so forth.
 *
 * TODO: This module is essentially hardcoded as of late January 2015, but at some point should become dynamic,
 * meaning that it will generate the sim list and URLs in some standard way based on the list of active simulations
 * already maintained in GitHub (see chipper/active-sims).  The reason that it is hardcoded now is that most sims
 * haven't been published with the code that supports the needed approach for query parameter string loading.
 */
'use strict'; // TODO: Does this work, and is it needed?

var simInfo = {
  reactantsProductsAndLeftovers: {
    simTitle: 'Reactants, Products, and Leftovers',
    projectName: 'reactants-products-and-leftovers',
    urlOfTestFile: 'http://phet.colorado.edu/sims/html/reactants-products-and-leftovers/latest/reactants-products-and-leftovers_en.html'
  },
  arithmetic: {
    simTitle: 'Arithmetic',
    projectName: 'arithmetic',
    urlOfTestFile: 'http://www.colorado.edu/physics/phet/dev/html/arithmetic/1.0.0-dev.12/arithmetic_en.html'
  },
  neuron: {
    simTitle: 'Neuron',
    projectName: 'neuron',
    urlOfTestFile: 'http://www.colorado.edu/physics/phet/dev/html/neuron/1.0.0-dev.7/neuron_en.html'
  }
};

/**
 * Get the URL for the HTML5 simulation that should be used for testing of a translation using the 'strings' queary
 * parameter.
 * @param {string} projectName - Project name for the simulation, same as the GitHub repo name.
 * @returns {string} url to use for testing
 */
module.exports.getSimTestUrl = function( projectName ) {
  for ( var key in simInfo ) {
    if ( simInfo.hasOwnProperty( key ) ) {
      if ( projectName === simInfo[ key ].projectName ) {
        return simInfo[ key ].urlOfTestFile;
      }
    }
  }
};
