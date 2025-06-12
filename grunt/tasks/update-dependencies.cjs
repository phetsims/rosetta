// Copyright 2022, University of Colorado Boulder

/**
 * Rosetta depends on parallel checkouts of chipper and perennial-alias, so we update these repos as part of updating
 * rosetta. For this to work, these repos need to have been initially cloned.  For the history of this, see:
 * https://github.com/phetsims/phet-io/issues/1874#issuecomment-1233493616
 *
 * This task is intended to be used when you are pulling rosetta onto the production server or the test server.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 * @author John Blanco (PhET Interactive Simulations)
 */
'use strict';

const fs = require( 'fs' );
const gitCheckout = require( '../../../perennial-alias/js/common/gitCheckout.js' );
const gitPull = require( '../../../perennial-alias/js/common/gitPull.js' );
const npmUpdate = require( '../../../perennial-alias/js/common/npmUpdate.js' );

( async function() {

  const dependencies = JSON.parse( fs.readFileSync( './dependencies.json', 'utf8' ) );

  for ( const repo of Object.keys( dependencies ) ) {

    // Pull the latest changes from the remote repository.
    try {
      const pullResult = await gitPull( repo );
      console.log( pullResult );
    }
    catch( e ) {
      throw new Error( `issue with git pull on ${repo}: ${e}` );
    }

    // Check out the version of the repo that is specified in the dependencies file.
    try {
      console.log( `Checking out SHA ${dependencies[ repo ].sha} for ${repo}` );
      await gitCheckout( repo, dependencies[ repo ].sha );
    }
    catch( e ) {
      throw new Error( `error checking out SHA for ${repo}: ${e}` );
    }

    // Update node packages for the dependency.
    try {
      await npmUpdate( repo );
    }
    catch( e ) {
      throw new Error( `issue with npm update on ${repo}: ${e}` );
    }
  }
} )();