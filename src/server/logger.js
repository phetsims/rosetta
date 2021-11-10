// Copyright 2021, University of Colorado Boulder

import winston from 'winston';

const logger = winston.createLogger( {
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  level: 'info',
  transports: [
    new winston.transports.Console()
  ]
} );

export { logger as default };