// Copyright 2024, University of Colorado Boulder

/**
 * This file is intended to be used as a test harness when developing functions or other code that can be tested
 * independently of the Rosetta client and server.  This can be used to make the test-debug cycle a bit quicker.
 *
 * Feel free to modify this as needed to remove old tests and add new ones.  It is not intended to become a collection
 * of tests.
 *
 * Usage Example:
 *   node test-harness-for-functions
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

// imports
import getStringKeysUsedInSim from '../../src/server/translationApi/getStringKeysUsedInSim.js';

// Put the test code here.
getStringKeysUsedInSim( 'states-of-matter-basics' );