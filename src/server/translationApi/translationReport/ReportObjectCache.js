// Copyright 2022, University of Colorado Boulder

/**
 * Define the report object cache class. At startup, we create an object based on this
 * class. As Rosetta gets requests for report objects, they are cached in this report object
 * cache. (It takes a while to get them.) These objects are sent to the client to create the
 * translation report.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import publicConfig from '../../../common/publicConfig.js';

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
      const withinSimMetadataCacheWindow = Date.now() - this[ locale ][ sim ].timestamp
                                        < publicConfig.VALID_METADATA_DURATION;
      if (
        !this[ locale ][ sim ].isDirty
        || ( this[ locale ][ sim ].isDirty && withinSimMetadataCacheWindow )
      ) {
        return this[ locale ][ sim ];
      }
    }
    return null;
  }
}

export default ReportObjectCache;