// Copyright 2021, University of Colorado Boulder

import dotenv from 'dotenv';
import os from 'os';
import path from 'path';

const dotenvPath = {
  path: path.join( os.homedir(), '.phet', 'rosetta-config.env' )
};
dotenv.config( dotenvPath );
const config = process.env;
export { config as default };