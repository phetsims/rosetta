// Copyright 2022, University of Colorado Boulder

/**
 * Define Grunt tasks for rosetta.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 * @author John Blanco
 */
'use strict';

const Gruntfile = require( '../chipper/Gruntfile.js' );
const registerTasks = require( '../perennial/js/grunt/util/registerTasks.js' );

module.exports = function( grunt ) {
  Gruntfile( grunt ); // use chipper's gruntfile
  registerTasks( grunt, `${__dirname}/grunt/tasks/` );
};