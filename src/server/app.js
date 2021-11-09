const express = require( 'express' );
const path = require( 'path' );

const PORT = 3000;
const STATIC_ASSETS_PATH = path.join( __dirname, '..', '..', 'static' );

const app = express();

app.use( '/static', express.static( STATIC_ASSETS_PATH ) );
app.get( '/', ( req, res ) => {
  const html = `
    <!doctype html>
    <html lang="en">
      <body>
        <div id="root"></div>
        <script src="/static/bundle.js"></script>
      </body>
    </html>
  `;
  res.send( html );
} );

app.listen( PORT, () => console.log( `http://localhost:${PORT}` ) );