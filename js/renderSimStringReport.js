// Copyright 2021, University of Colorado Boulder

const routeHandlers = require('./routeHandlers');

/**
 * Renders the sim string report.
 *
 * @author Liam Mulhall
 */
async function renderSimStringReport( request, response ) {

  const simName = request.params.simName;
  const targetLocale = request.params.targetLocale;
  const untranslatedStringKeysMap = await routeHandlers.getUntranslatedStringKeysMap( simName, targetLocale );
  const simSpecificStringKeysArray = await routeHandlers.getSimSpecificStringKeysArray( simName, untranslatedStringKeysMap );
  const commonStringKeysArray = await routeHandlers.getCommonStringKeysArray( simName, untranslatedStringKeysMap );

  response.render( 'sim-string-report.html', {
    title: 'Sim String Report',
    simName: simName,
    targetLocale: targetLocale,
    simSpecificStringKeysArray: simSpecificStringKeysArray,
    numSimSpecificStringKeys: simSpecificStringKeysArray.length,
    commonStringKeysArray: commonStringKeysArray,
    numCommonStringKeys: commonStringKeysArray.length
  } );
}

module.exports = renderSimStringReport;