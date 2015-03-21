// Copyright 2002-2015, University of Colorado Boulder

/**
 * Setup Winston as logger for Rosetta
 *
 * @author Brian Newsom
 */

// Set defaults for logging
var defaultLogFile = '';
var defaultSilent = false;

/**
 * Create a Winston logger that will log to a given file and or the console.
 *
 * @param logFile String - location of file to write logs, specified from root.  Pass empty string for no log file.
 *  Defaults to defaultLogFile if no argument.
 * @param silent Boolean - whether or not to log to console.  Defaults to defaultSilent.
 */
module.exports = function(logFile, silent ) {
    var winston = require( 'winston' );

    var logFile = logFile || defaultLogFile;
    var silent = silent || defaultSilent;
    var transports = [];

    if( !silent ) {
        transports.push( new ( winston.transports.Console )( ) );
    }
    if ( logFile ) {
        transports.push( new ( winston.transports.File ) ({ filename: logFile }) );
    }

    var logger = new ( winston.Logger ) ({
        transports: transports
    });

    logger.log( 'info', 'Create Winston logger' )
    return logger;
}
