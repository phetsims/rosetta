// Copyright 2020, University of Colorado Boulder

/**
 * This file sets up Winston for running tests. If you run tests without setting up Winston, you'll get messages
 * complaining that Winston has no transports. You'll get these messages because the code you're testing uses Winston,
 * but you haven't set it up; Winston is normally set up in rosetta.js.
 *
 * @author Liam Mulhall (PhET Interactive Simulations)
 */

// Modules
const winston = require( 'winston' );

// Constants
const { format } = winston;

// You can turn on logging by setting the silent option to true.
const consoleTransport = new winston.transports.Console( {
  format: format.combine(
    format.timestamp( {
      format: 'YYYY-MM-DD HH:mm:ss'
    } ),
    format.printf( i => `${i.timestamp} | ${i.level} - ${i.message}` )
  ),
  silent: true
} );
winston.add( consoleTransport );