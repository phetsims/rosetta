// Copyright 2022, University of Colorado Boulder

/**
 * Define the report object cache class. At startup, we create an object based on this
 * class with cached report objects. These objects are sent to the client to create the
 * translation report.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

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

// This rule doesn't really apply to Rosetta.
// This is the only class in the codebase. Otherwise, put this in the ESLint config?
// For the paper trail on this issue, see https://github.com/phetsims/phet-core/issues/100.
// eslint-disable-next-line default-export-class-should-register-namespace
export default ReportObjectCache;