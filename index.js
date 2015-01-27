var express = require( 'express' );
var https = require( 'https' );
var app = express();
var doT = require( 'express-dot' );
var pub = __dirname + '/public';
var view = __dirname + '/views';

app.configure( function() {
  app.set( 'views', __dirname + '/html/views' );
  app.set( 'view engine', 'dot' );
  app.engine( 'html', doT.__express );
  app.use( '/translate/css', express.static( __dirname + '/public/css' ) );
  app.use( '/translate/sim/css', express.static( __dirname + '/public/css' ) );
  app.use( '/translate/img', express.static( __dirname + '/public/img' ) );
  app.use( '/translate/js', express.static( __dirname + '/public/js' ) );
  app.use( '/translate/sim/js', express.static( __dirname + '/public/js' ) );
  app.use( '/translate/fonts', express.static( __dirname + '/public/fonts' ) );
} );

app.get( '/', function( req, res ) {
  var templateData = { title: "This title is from the template data JSON object" };
  res.render( 'index.html', templateData );
} );

app.get( '/nolayout', function( req, res ) {
  var templateData = { title: "This title is from the template data JSON object", layout: false };
  res.render( 'index.html', templateData );
} );

app.get( '/translate/', function( req, res ) {

  // Pull the string data from github.
  https.get( {
    host: 'raw.githubusercontent.com',
    path: '/phetsims/chains/master/strings/chains-strings_en.json'
  }, function( response ) {
    response.on( 'data', function( data ) {

      // Parse the returned JSON data into a JavaScript object.
      strings = JSON.parse( data );

      // Create a table for the strings to be translated.
      var stringsTable = '';
      for ( var key in strings ) {
        if ( strings.hasOwnProperty( key ) ) {
          stringsTable += '<tr>';
          stringsTable += '<td>' + strings[ key ] + '</td>';
          stringsTable += '<td><input type=\"text\" </td>';
          stringsTable += '</tr>';
        }
      }

      // Assemble the data that will be supplied to the template.
      var templateData = {
        title: "Enter a translation for each English string:",
        destinationLanguage: 'Spanish',
        stringsTable: stringsTable
      };

      // Render the page.
      res.render( 'index.html', templateData );
    } );
  } );
} );

function escapeHTML( s ) {
  return s.replace( /&/g, '&amp;' )
    .replace( /"/g, '&quot;' )
    .replace( /</g, '&lt;' )
    .replace( />/g, '&gt;' );
}

// Handle a URL to translate a specific simulation.
app.get( '/translate/sim/:simName', function( req, res ) {

  var simName = req.param( 'simName' );
  var path = '/phetsims/' + simName + '/master/strings/' + simName + '-strings_en.json';

  // Pull the string data from github.
  https.get( { host: 'raw.githubusercontent.com', path: path }, function( response ) {
    response.on( 'data', function( data ) {

      if ( response.statusCode === 200 ) {
        // Parse the returned JSON data into a JavaScript object.
        strings = JSON.parse( data );

        // Create a table for the strings to be translated.
        var stringsTable = '';
        for ( var key in strings ) {
          if ( strings.hasOwnProperty( key ) ) {
            stringsTable += '<tr>';
            stringsTable += '<td>' + escapeHTML( strings[ key ] ) + '</td>';
            stringsTable += '<td><input type=\"text\" </td>';
            stringsTable += '</tr>';
          }
        }

        // Assemble the data that will be supplied to the template.
        var templateData = {
          title: "Enter a translation for each English string:",
          destinationLanguage: 'Spanish',
          stringsTable: stringsTable
        };

        // Render the page.
        res.render( 'index.html', templateData );
      }
      else {
        res.send( 'Error: Sim data not found' );
      }
    } );
  } );
} );

app.listen( 16372 );
