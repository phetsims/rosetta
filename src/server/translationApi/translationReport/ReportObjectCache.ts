// Copyright 2022, University of Colorado Boulder

/**
 * Cache for translation report objects. This is used to cache the translation report objects so they don't have to be
 * rebuilt all the time, since it takes time and a bunch of requests to long-term storage to create them.  At startup,
 * we create an instance of this class. As Rosetta gets requests for report objects, they are cached here.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 * @author John Blanco (PhET Interactive Simulations)
 */

import publicConfig from '../../../common/publicConfig.js';
import ReportObject from '../../../common/ReportObject.js';
import logger from '../logger.js';

class ReportObjectCache {

  private cache: Record<string, Record<string, ReportObject>> = {};

  /**
   * Set the object in the cache. This is used to store the report object.
   * @param locale - two-letter locale code
   * @param sim - sim name in kabob case, e.g. 'energy-skate-park'
   * @param reportObject - the report object to store
   * @param timestamp - the times at which the object was created in ms since epoch (Date.now() format)
   */
  public setObject(
    locale: string,
    sim: string,
    reportObject: ReportObject,
    timestamp: number
  ): void {
    if ( this.cache[ locale ] === undefined ) {
      this.cache[ locale ] = {};
    }
    this.cache[ locale ][ sim ] = reportObject;
    this.cache[ locale ][ sim ].timestamp = timestamp;
    this.cache[ locale ][ sim ].isDirty = false;
  }

  /**
   * Mark a report object as dirty if it is present in the cache. This is used to force an update on the next access.
   */
  public setDirtyObject( locale: string, sim: string ): void {
    if ( this.cache[ locale ] !== undefined && this.cache[ locale ][ sim ] !== undefined ) {
      this.cache[ locale ][ sim ].isDirty = true;
    }
  }

  /**
   * @param locale
   * @param sim
   * @returns The cached report object or null if not available/valid
   */
  public getObject( locale: string, sim: string ): ReportObject | null {
    let reportObject: ReportObject | null = null;
    if ( this.cache[ locale ] !== undefined && this.cache[ locale ][ sim ] !== undefined ) {
      const withinSimMetadataCacheWindow = Date.now() - this.cache[ locale ][ sim ].timestamp
                                           < publicConfig.VALID_METADATA_DURATION;
      if ( !this.cache[ locale ][ sim ].isDirty && withinSimMetadataCacheWindow ) {
        reportObject = this.cache[ locale ][ sim ];
        logger.info( `ReportObjectCache.getObject: returning cached report object for ${locale}/${sim}` );
      }
      else {
        logger.info( `ReportObjectCache.getObject: report object for ${locale}/${sim} dirty or stale, returning null` );
      }
    }
    else {
      logger.info( `ReportObjectCache.getObject: report object for ${locale}/${sim} not found, returning null` );
    }
    return reportObject;
  }

  /**
   * @param locale
   * @param sim
   * @returns - whether the object was successfully flushed
   */
  public flushObject( locale: string, sim: string ): boolean {
    let flushed = false;
    if ( this.cache[ locale ] !== undefined && this.cache[ locale ][ sim ] !== undefined ) {
      delete this.cache[ locale ][ sim ];
      flushed = true;
    }
    return flushed;
  }
}

export default ReportObjectCache;