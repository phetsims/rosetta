// Copyright 2022, University of Colorado Boulder

/**
 * Define Grunt tasks for rosetta.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 * @author John Blanco
 */
'use strict';

const Gruntfile = require( '../chipper/Gruntfile' );
const registerTasks = require( '../perennial-alias/js/grunt/commonjs/registerTasks' );

module.exports = function( grunt ) {
  Gruntfile( grunt ); // use chipper's gruntfile
  registerTasks( grunt, `${__dirname}/grunt/tasks/` );
};