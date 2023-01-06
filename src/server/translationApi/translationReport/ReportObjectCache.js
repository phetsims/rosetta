// Copyright 2022, University of Colorado Boulder

/**
 * Define the report object cache class. At startup, we create an object based on this
 * class. As Rosetta gets requests for report objects, they are cached in this report object
 * cache. (It takes a while to get them.) These objects are sent to the client to create the
 * translation report.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

// As of this writing, this is the amount of time the sim metadata from the website could
// be cached and therefore could be stale. Note that this isn't Rosetta's cached sim
// metadata, but the website's cached sim metadata.
const WORST_CASE_SIM_METADATA_STALE_PERIOD = 172800000;

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
   * @returns {Object|null}
   * @public
   */
  getObject( locale, sim ) {
    if ( this[ locale ] !== undefined
         && this[ locale ][ sim ] !== undefined
    ) {
      const withinWebsiteSimMetadataCacheWindow = Date.now() - this[ locale ][ sim ].timestamp
                                        < WORST_CASE_SIM_METADATA_STALE_PERIOD;
      if (
        !this[ locale ][ sim ].isDirty
        || ( this[ locale ][ sim ].isDirty && withinWebsiteSimMetadataCacheWindow )
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