// Copyright 2021, University of Colorado Boulder

const dotenv = require( 'dotenv' );
const os = require( 'os' );
const path = require( 'path' );

const dotenvPath = {
  path: path.join( os.homedir(), '.phet', 'rosetta-config.env' )
};
dotenv.config( dotenvPath );
const config = process.env;
module.exports = config;