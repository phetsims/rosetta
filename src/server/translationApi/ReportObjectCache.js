// Copyright 2022, University of Colorado Boulder

class ReportObjectCache {

  /**
   * @param locale
   * @param sim
   * @param reportObject
   * @public
   */
  setObject( locale, sim, reportObject ) {
    if ( this[ locale ] === undefined ) {
      this[ locale ] = {};
    }
    this[ locale ][ sim ] = {
      reportObject: reportObject,
      isDirty: false
    };
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
         && !this[ locale ][ sim ].isDirty
    ) {
      return this[ locale ][ sim ].reportObject;
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