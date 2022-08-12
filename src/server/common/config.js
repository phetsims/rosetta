// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a variable with the key-value pairs from the configuration file for the translation tool.
 *
 * @author Liam Mulhall
 */

import dotenv from 'dotenv';
import os from 'os';
import path from 'path';
import getCurrentSha from '../translationApi/getCurrentSha.js';

// specify directory where config lives
// on unix systems, this should be ~/.phet, per phet convention
const dotenvPath = {
  path: path.join( os.homedir(), '.phet', 'rosetta-config.env' )
};

// load key-value pairs from config into process.env
dotenv.config( dotenvPath );

// provide variable with all the key-value pairs from the config
const config = process.env;
config.sha = getCurrentSha();

export default config;