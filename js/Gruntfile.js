// Copyright 2022, University of Colorado Boulder

/**
 * This is Rosetta's specific Gruntfile.
 *
 * @author Liam Mulhall
 * @author John Blanco
 */

const Gruntfile = require( '../../chipper/js/grunt/Gruntfile' );
const gitPull = require( '../../perennial/js/common/gitPull.js' );

module.exports = grunt => {
  Gruntfile( grunt );

  /**
   * Rosetta depends on a parallel checkout of perennial, so we update perennial as part of updating Rosetta.
   * For the history of this, see:
   * https://github.com/phetsims/phet-io/issues/1874#issuecomment-1233493616
   *
   * Basically, rosetta needs to use some code in perennial. We don't want to duplicate the code, so we are adding a
   * dependency of a parallel perennial checkout.
   */
  grunt.registerTask( 'update-rosetta', 'This task pulls the latest versions of rosetta and its dependencies.', () => {

    // pull latest perennial changes
    gitPull( 'perennial' );

    // pull latest rosetta changes
    gitPull( 'rosetta' );
  } );
};