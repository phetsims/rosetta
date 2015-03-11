// Copyright 2002-2015, University of Colorado Boulder

/**
 * This file holds various utilities useful for translation
 *
 * @author Aaron Davis
 */

var http = require( 'http' );

/**
 * Route that extracts strings from a built sim. Expects query parameter 'simUrl', the url of the built sim to
 * extract the strings from.
 *
 * @param req
 * @param res
 */
module.exports.extractStrings = function( req, res ) {
  // included for an easy default test
  var url = req.param( 'simUrl' ) || 'www.colorado.edu/physics/phet/dev/html/arithmetic/1.0.0-dev.13/arithmetic_en.html';
  var localhost = ( url.indexOf( 'localhost' ) === 0 );

  var slashIndex = url.indexOf( '/' );
  var host = ( localhost ) ? 'localhost' : url.substring( 0, slashIndex );
  var path = url.substring( slashIndex );

  var options = {
    host: host,
    path: path,
    method: 'GET'
  };

  // if running locally get the port number if it is part of the url
  if ( localhost ) {
    var colonIndex = url.indexOf( ':' );
    if ( colonIndex > -1 ) {
      options.port = url.substring( colonIndex + 1, slashIndex );
    }
  }

  console.log( 'requesting sim at host: ' + options.host + ', port: ' + options.port + ', and path: ' + options.path );

  // convenience method to check if an item is in an array
  var contains = function( array, item ) {
    for ( var i = 0; i < array.length; i++ ) {
      if ( array[i] === item ) {
        return true;
      }
    }
    return false;
  };

  var sessionDataRequestCallback = function( response ) {
    var data = '';

    // another chunk of data has been received, so append it
    response.on( 'data', function( chunk ) {
      data += chunk;
    } );

    // the whole response has been received
    response.on( 'end', function() {
      var result = [];
      var projects = {};
      var matches = data.match( /string!([\w\.\/]+)/g );

      // if no matches are found, it probably means the sim url was not correct
      if ( matches === null ) {
        res.send( '<p>Error: No strings found at ' + host + path + '</p>' );
      }

      for ( var i = 0; i < matches.length; i++ ) {
        var projectAndString = matches[i].substring( 7 ).split( '/' );
        var projectName = projectAndString[0];
        var string = projectAndString[1];

        projects[projectName] = projects[projectName] || [];

        if ( !contains( projects[projectName], string ) ) {
          projects[projectName].push( string );
        }
      }

      for ( var project in projects ) {
        result.push( {
          projectName: project.replace( '_', '-' ).toLowerCase(),
          stringKeys: projects[project]
        } );
      }

      res.setHeader( 'Content-Type', 'application/json' );
      res.end( JSON.stringify( result, null, 3 ) );
    } );
  };

  var strings = http.request( options, sessionDataRequestCallback );

  strings.on( 'error', function( err ) {
    console.log( 'Error getting sim strings - ' + err );
    res.render( 'error.html', {
        title: 'Translation Utility Error',
        message: 'Unable to obtain sim strings',
        errorDetails: err,
        timestamp: new Date().getTime()
      }
    );
  } );

  // send the request
  strings.end();
};
