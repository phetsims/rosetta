// Copyright 2022, University of Colorado Boulder

/**
 * This file defines a NodeJS script that can be used to trigger multiple simulation builds.  This is helpful when there
 * are a lot of builds to be done and it would be too time-consuming to do them all through the UI.  See
 * https://github.com/phetsims/rosetta/issues/389 and https://github.com/phetsims/perennial/issues/326.
 *
 * Usage Example:
 *   node trigger-multiple-translation-builds
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

// imports
const axios = require( 'axios' );
const getMostRecentUserId = require( './common/getMostRecentUserId.js' );

// constants
const INTER_BUILD_DELAY = 120; // in seconds, used to prevent build server from being totally consumed

// List of sim+locals to build.
const SIM_AND_LOCALE_LIST = [
  {
    simName: 'build-an-atom',
    locale: 'mk'
  },
  {
    simName: 'calculus-grapher',
    locale: 'pl'
  },
  {
    simName: 'number-play',
    locale: 'pl'
  },
  {
    simName: 'faradays-law',
    locale: 'vi'
  },
  {
    simName: 'forces-and-motion-basics',
    locale: 'vi'
  },
  {
    simName: 'john-travoltage',
    locale: 'vi'
  },
  {
    simName: 'my-solar-system',
    locale: 'sr'
  }
];

/**
 * Helper function to that can be used to pause the action in the script.
 */
const delay = seconds => {
  return new Promise( resolve => setTimeout( resolve, seconds * 1000 ) );
};

// Wrap the main contents of the script in an async block so that async/await syntax can be used.
( async () => {

  // Iterate through the list of sims and submit build requests for each.
  for ( let i = 0; i < SIM_AND_LOCALE_LIST.length; i++ ) {
    const simName = SIM_AND_LOCALE_LIST[ i ].simName;
    const locale = SIM_AND_LOCALE_LIST[ i ].locale;
    const userId = getMostRecentUserId( simName, locale );
    if ( userId !== null ) {

      console.log( `\nRequesting build for sim ${i + 1} of ${SIM_AND_LOCALE_LIST.length}` );
      console.log( `sim = ${simName}, locale = ${locale}, and userId = ${userId}` );
      const buildRequestUrl = `https://phet.colorado.edu/translate/api/triggerBuild/${simName}/${locale}/${userId}`;
      console.log( `buildRequestUrl = ${buildRequestUrl}` );
      let response;
      try {
        response = await axios.get( buildRequestUrl );
      }
      catch( err ) {
        console.log( `  Error when requesting build: ${err}, aborting.` );
        process.exit( 1 );
      }
      if ( response ) {
        console.log( `  response.status = ${response.status}` );
        console.log( `  response.data = ${JSON.stringify( response.data )}` );
      }

      // Delay between each request so as not to overwhelm the build server.
      if ( i < SIM_AND_LOCALE_LIST.length - 1 ) {
        await delay( INTER_BUILD_DELAY );
      }
    }
    else {
      console.log( `  No user ID found, skipping build for ${simName}, locale ${locale}` );
    }
  }
} )();