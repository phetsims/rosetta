// Copyright 2021-2023, University of Colorado Boulder

// modules
//const axios = require( 'axios' );

// server modules
//const routeHandlers = require( './routeHandlers' );
const simData = require( './simData' );

// constants
// const PRODUCTION_SERVER_URL = global.config.productionServerURL;
// const METADATA_URL = `${PRODUCTION_SERVER_URL}/services/metadata/1.2/simulations?format=json&type=html&include-unpublished=true&summary`;
// const METADATA_REQUEST_OPTIONS = {
//   auth: {
//     username: 'token',
//     password: global.config.serverToken
//   }
// };

// let simMetadata = null;
//
// async function getSimMetadata() {
//   const simMetadataResponse = await axios.get( METADATA_URL, METADATA_REQUEST_OPTIONS );
//   simMetadata = simMetadataResponse.data;
//   return simMetadata;
// }
//
// async function getTranslationStatusArray( simNameArray, request ) {
//
//   let translationStatusArray = [];
//
//   const targetLocale = request.params.targetLocale;
//
//   for ( const simName of simNameArray ) {
//
//     const simUntranslated = false;
//
//     // TODO: There should be some way to figure this out based on the metadata. https://github.com/phetsims/rosetta/issues/357
//     if ( simUntranslated ) {
//       translationStatusArray.push( 'completely untranslated' );
//     }
//     else {
//       // We need to find out if the sim is partially or fully translated.
//
//       const translatedStringKeysMap = await routeHandlers.getTranslatedStringKeysMap( simName, targetLocale );
//       const presentedToUserStringKeysMap = await routeHandlers.getPresentedToUserStringKeysMap( simName );
//       if ( translatedStringKeysMap === presentedToUserStringKeysMap ) {
//         translationStatusArray.push( 'completely translated' );
//       }
//       else {
//         translationStatusArray.push( 'partially translated' );
//       }
//     }
//   }
//
//   return translationStatusArray;
// }
//
// async function getTranslationInfoObject( simName, simNameArray ) {
//   let translationInfoObject = {};
// }

async function renderLocaleStringReport( request, response ) {

  const targetLocale = request.params.targetLocale;
  const simNameArray = await simData.getListOfSimNames( false );
  //const translationStatusArray = await getTranslationStatusArray( simNameArray, request );

  response.render( 'locale-string-report.html', {
    title: 'Locale String Report',
    targetLocale: targetLocale,
    simNameArray: simNameArray
    //translationStatusArray: translationStatusArray
  } );
}

module.exports = renderLocaleStringReport;
