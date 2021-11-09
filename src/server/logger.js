// Copyright 2021, University of Colorado Boulder

const winston = require( 'winston' );

const logger = winston.createLogger( {
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  level: 'info',
  transports: [
    new winston.transports.Console(),
  ]
} );

module.exports = logger;