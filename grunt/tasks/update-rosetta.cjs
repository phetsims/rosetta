// Copyright 2022, University of Colorado Boulder

/**
 * Rosetta depends on a parallel checkout of perennial, perennial-alias, and chipper, so we update these repos
 * as part of updating rosetta. For the history of this, see:
 * https://github.com/phetsims/phet-io/issues/1874#issuecomment-1233493616
 *
 * This task is intended to be used when you are pulling rosetta onto the production server or the test server.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 * @author John Blanco
 */
'use strict';

const cloneRepo = require( '../../../perennial/js/common/cloneRepo.js' );
const fs = require( 'fs' );
const gitPull = require( '../../../perennial/js/common/gitPull' );
const npmUpdate = require( '../../../perennial/js/common/npmUpdate.js' );

const REPO_DEPENDENCIES = [ 'chipper', 'perennial', 'perennial-alias' ];

( async function() {
  for ( const repo of REPO_DEPENDENCIES ) {

    // Try to clone repos.
    if ( !fs.existsSync( `../${repo}` ) ) {
      try {
        await cloneRepo( repo );
      }
      catch( e ) {
        throw new Error( `issue with cloning ${repo}: ${e}` );
      }
    }

    // Try to pull repos.
    try {
      const pullResult = await gitPull( repo );
      console.log( pullResult );
    }
    catch( e ) {
      throw new Error( `issue with git pull on ${repo}: ${e}` );
    }

    // Try to update repos.
    try {
      await npmUpdate( repo );
    }
    catch( e ) {
      throw new Error( `issue with npm update on ${repo}: ${e}` );
    }
  }
} )();