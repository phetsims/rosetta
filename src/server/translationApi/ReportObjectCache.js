// Copyright 2022, University of Colorado Boulder

import getMinutesElapsed from '../../common/getMinutesElapsed.js';

class ReportObjectCache {

  /**
   * @param locale
   * @param sim
   * @param reportObject
   * @param timestamp
   * @public
   */
  setObject( locale, sim, reportObject, timestamp ) {
    if ( this[ locale ] === undefined ) {
      this[ locale ] = {};
    }
    this[ locale ][ sim ] = reportObject;
    this[ locale ][ sim ].isDirty = false;
    this[ locale ][ sim ].timestamp = timestamp;
  }

  /**
   * @param locale
   * @param sim
   * @public
   */
  setDirtyObject( locale, sim ) {
    if ( this[ locale ] !== undefined && this[ locale ][ sim ] !== undefined ) {
      this[ locale ][ sim ].isDirty = true;
    }
  }

  /**
   * @param locale
   * @param sim
   * @returns {*|null}
   * @public
   */
  getObject( locale, sim ) {
    if ( this[ locale ] !== undefined
         && this[ locale ][ sim ] !== undefined
    ) {

      // For background on why this is here, see https://github.com/phetsims/rosetta/issues/316.
      const minutesElapsed = getMinutesElapsed( this[ locale ][ sim ].timestamp, Date.now() );
      const lessThanTenMinutesSinceCache = minutesElapsed < 10;
      if (
        !this[ locale ][ sim ].isDirty
        || ( this[ locale ][ sim ].isDirty && lessThanTenMinutesSinceCache )
      ) {
        return this[ locale ][ sim ];
      }
    }
    return null;
  }
}

// ( () => {
//   const repObj1 = {
//     simName: 'foo',
//     simTitle: 'Foo',
//     numCommonStrings: 21,
//     numCommonTranslatedStrings: 21,
//     numSimSpecificStrings: 21,
//     numSimSpecificTranslatedStrings: 21
//   };
//   const reportObjectCache = new ReportObjectCache();
//   reportObjectCache.setObject( 'fo', 'foo', repObj1 );
//   console.log( JSON.stringify( reportObjectCache, null, 4 ) );
//   const got = reportObjectCache.getObject( 'fo', 'foo' );
//   console.log( `got = ${JSON.stringify( got, null, 4 )}` );
//   reportObjectCache.setDirtyObject( 'fo', 'foo' );
//   console.log( JSON.stringify( reportObjectCache, null, 4 ) );
// } )();

export default ReportObjectCache;