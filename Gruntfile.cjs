// Copyright 2022, University of Colorado Boulder

/**
 * Define Grunt tasks for rosetta.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 * @author John Blanco
 */

const Gruntfile = require( '../chipper/js/grunt/Gruntfile' );
const cloneRepo = require( '../perennial/js/common/cloneRepo.js' );
const fs = require( 'fs' );
const gitPull = require( '../perennial/js/common/gitPull' );
const npmUpdate = require( '../perennial/js/common/npmUpdate.js' );
const winston = require( 'winston' );

const REPO_DEPENDENCIES = [ 'chipper', 'perennial', 'perennial-alias' ];

const logger = winston.createLogger( {
  format: winston.format.combine(
    winston.format.simple()
  ),
  level: 'info',
  transports: [
    new winston.transports.Console()
  ]
} );

module.exports = grunt => {
  Gruntfile( grunt );

  /**
   * Rosetta depends on a parallel checkout of perennial, so we update perennial as part of updating rosetta.
   * For the history of this, see:
   * https://github.com/phetsims/phet-io/issues/1874#issuecomment-1233493616
   *
   * Basically, rosetta needs to use some code in perennial. We don't want to duplicate the code, so we are adding a
   * dependency of a parallel perennial checkout.
   */
  grunt.registerTask( 'update-rosetta', 'This task pulls the latest versions of rosetta and its dependencies.', async function() {

    // Tell Grunt this is an async task. Note how we use a regular function instead of an arrow function.
    // See https://gruntjs.com/inside-tasks#this.async.
    const done = this.async();
    const errors = [];

    for ( const repo of REPO_DEPENDENCIES ) {

      // Try to clone repos.
      if ( !fs.existsSync( `../${repo}` ) ) {
        try {
          await cloneRepo( repo );
        }
        catch( e ) {
          logger.error( `issue with cloning ${repo}: ${e}` );
        }
      }

      // Try to pull repos.
      try {
        const pullResult = await gitPull( repo );
        logger.info( pullResult );
      }
      catch( e ) {
        logger.error( `issue with git pull on ${repo}: ${e}` );
        errors.push( e );
      }

      // Try to update repos.
      try {
        await npmUpdate( repo );
      }
      catch( e ) {
        logger.error( `issue with npm update on ${repo}: ${e}` );
        errors.push( e );
      }
    }

    done( errors.length === 0 );
  } );
};