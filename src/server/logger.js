// Copyright 2021, University of Colorado Boulder

import config from './config.js';
import winston from 'winston';

const logger = winston.createLogger( {
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  level: config.LOGGER_LEVEL,
  transports: [
    new winston.transports.Console()
  ]
} );

export { logger as default };