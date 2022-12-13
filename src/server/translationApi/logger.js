// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export the Winston logger. See Winston's documentation for details on how to set up a logger.
 *
 * @author Liam Mulhall
 */

import winston from 'winston';
import privateConfig from '../../common/privateConfig.js';

const logger = winston.createLogger( {
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  level: privateConfig.LOGGER_LEVEL,
  transports: [
    new winston.transports.Console()
  ]
} );

export default logger;