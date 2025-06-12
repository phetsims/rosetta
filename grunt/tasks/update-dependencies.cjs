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

// Note that we can't have dependencies on perennial-alias or chipper here, because this is used to update those repos.

const fs = require( 'fs' );
const { exec } = require( 'child_process' );

( async function() {

  function execAsync( command, options = {} ) {
    return new Promise( ( resolve, reject ) => {
      exec( command, options, ( error, stdout, stderr ) => {
        if ( error ) {
          reject( stderr || error );
        }
        else {
          resolve( stdout );
        }
      } );
    } );
  }

  // Read the dependencies file, which contains the SHA of each dependency that we want to check out.
  const dependencies = JSON.parse( fs.readFileSync( './dependencies.json', 'utf8' ) );

  for ( const repo of Object.keys( dependencies ) ) {

    // Clone the dependency repo if it doesn't yet exist.
    if ( !fs.existsSync( repo ) ) {
      try {
        const sourceRepo = repo.replace( '-alias', '' );
        const repoUrl = `https://github.com/phetsims/${sourceRepo}.git`;
        const destinationDir = `../${repo}`;
        console.log( `Cloning ${sourceRepo} into ${destinationDir}` );
        await execAsync( `git clone ${repoUrl} ${destinationDir}` );
      }
      catch( e ) {
        throw new Error( `error cloning ${repo}: ${e}` );
      }
    }

    // Pull the latest changes from the remote repository.
    try {
      await execAsync( `git -C ../${repo} pull` );
    }
    catch( e ) {
      throw new Error( `error with git pull on ${repo}: ${e}` );
    }

    // Check out the version of the repo that is specified in the dependencies file.
    try {
      console.log( `Checking out SHA ${dependencies[ repo ].sha} for ${repo}` );
      await execAsync( `git -C ../${repo} checkout ${dependencies[ repo ].sha}` );
    }
    catch( e ) {
      throw new Error( `error checking out SHA for ${repo}: ${e}` );
    }

    // Update node packages for the dependency.
    try {
      await execAsync( `npm --prefix ../${repo} prune` );
      await execAsync( `npm --prefix ../${repo} update` );
    }
    catch( e ) {
      throw new Error( `issue with npm update on ${repo}: ${e}` );
    }
  }
} )();