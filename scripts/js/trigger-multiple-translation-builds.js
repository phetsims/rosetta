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
const SIM_AND_LOCALE_LIST = [

  {
    simName: 'ratio-and-proportion',
    locale: 'bg'
  },
  {
    simName: 'gene-expression-essentials',
    locale: 'bg'
  },
  {
    simName: 'natural-selection',
    locale: 'bg'
  },
  {
    simName: 'neuron',
    locale: 'bg'
  },
  {
    simName: 'build-a-nucleus',
    locale: 'bg'
  },
  {
    simName: 'waves-intro',
    locale: 'bg'
  },
  {
    simName: 'circuit-construction-kit-dc-virtual-lab',
    locale: 'bg'
  },
  {
    simName: 'circuit-construction-kit-dc',
    locale: 'bg'
  },
  {
    simName: 'circuit-construction-kit-ac',
    locale: 'bg'
  },
  {
    simName: 'charges-and-fields',
    locale: 'bg'
  },
  {
    simName: 'capacitor-lab-basics',
    locale: 'bg'
  },
  {
    simName: 'balloons-and-static-electricity',
    locale: 'bg'
  },
  {
    simName: 'friction',
    locale: 'bg'
  },
  {
    simName: 'resistance-in-a-wire',
    locale: 'bg'
  },
  {
    simName: 'forces-and-motion-basics',
    locale: 'bg'
  },
  {
    simName: 'friction',
    locale: 'om'
  },
  {
    simName: 'forces-and-motion-basics',
    locale: 'om'
  },
  {
    simName: 'geometric-optics',
    locale: 'om'
  },
  {
    simName: 'quadrilateral',
    locale: 'ro'
  },
  {
    simName: 'quadrilateral',
    locale: 'pl'
  },
  {
    simName: 'quadrilateral',
    locale: 'da'
  },
  {
    simName: 'build-a-nucleus',
    locale: 'hu'
  },
  {
    simName: 'forces-and-motion-basics',
    locale: 'om'
  },
  {
    simName: 'geometric-optics',
    locale: 'om'
  },
  {
    simName: 'mean-share-and-balance',
    locale: 'om'
  },
  {
    simName: 'geometric-optics-basics',
    locale: 'om'
  },
  {
    simName: 'number-compare',
    locale: 'om'
  },
  {
    simName: 'ratio-and-proportion',
    locale: 'om'
  },
  {
    simName: 'ph-scale',
    locale: 'om'
  },
  {
    simName: 'beers-law-lab',
    locale: 'om'
  },
  {
    simName: 'quadrilateral',
    locale: 'pt_BR'
  },
  {
    simName: 'greenhouse-effect',
    locale: 'th'
  },
  {
    simName: 'number-play',
    locale: 'om'
  },
  {
    simName: 'energy-skate-park',
    locale: 'es'
  },
  {
    simName: 'number-line-integers',
    locale: 'es'
  },
  {
    simName: 'faradays-law',
    locale: 'es'
  },
  {
    simName: 'density',
    locale: 'es'
  },
  {
    simName: 'balloons-and-static-electricity',
    locale: 'ku'
  },
  {
    simName: 'beers-law-lab',
    locale: 'ku'
  },
  {
    simName: 'blackbody-spectrum',
    locale: 'ku'
  },
  {
    simName: 'build-a-nucleus',
    locale: 'ku'
  },
  {
    simName: 'make-a-ten',
    locale: 'th'
  },
  {
    simName: 'fraction-matcher',
    locale: 'ku'
  },
  {
    simName: 'area-model-algebra',
    locale: 'th'
  },
  {
    simName: 'balloons-and-static-electricity',
    locale: 'ku'
  },
  {
    simName: 'john-travoltage',
    locale: 'ku'
  },
  {
    simName: 'vector-addition',
    locale: 'ku'
  },
  {
    simName: 'energy-skate-park',
    locale: 'ku'
  },
  {
    simName: 'density',
    locale: 'ro'
  },
  {
    simName: 'density',
    locale: 'el'
  },
  {
    simName: 'density',
    locale: 'kn'
  },
  {
    simName: 'density',
    locale: 'pl'
  },
  {
    simName: 'density',
    locale: 'fr'
  },
  {
    simName: 'density',
    locale: 'it'
  },
  {
    simName: 'quadrilateral',
    locale: 'da'
  },
  {
    simName: 'density',
    locale: 'bg'
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