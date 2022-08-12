// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export the Winston logger. See Winston's documentation for details on how to set up a logger.
 *
 * @author Liam Mulhall
 */

import config from '../common/config.js';
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

export default logger;