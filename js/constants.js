// Copyright 2002-2015, University of Colorado Boulder

/**
 * This file holds constants used across rosetta
 *
 * @author Aaron Davis
 */

/* jslint node: true */
'use strict';

// modules
var assert = require( 'assert' );

/*
 * Change this to 'tests' for rosetta testing, so that commits will change the 'tests' branch of babel instead of master
 */
var BRANCH = 'master';

assert( BRANCH === 'master' || BRANCH === 'tests', 'BRANCH must be set to either master or tests' );

module.exports = {
  BRANCH: BRANCH,
  GITHUB_URL_BASE: 'https://raw.githubusercontent.com',
  SIM_INFO_ARRAY: 'data/simInfoArray.json'
};

