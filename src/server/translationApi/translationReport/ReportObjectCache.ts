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
import logger from '../logger.js';
import TranslationReportObject from './TranslationReportObject.js';

class ReportObjectCache {

  private cache: Record<string, Record<string, TranslationReportObject>> = {};

  /**
   * @param locale
   * @param sim
   * @param reportObject
   * @param timestamp
   */
  public setObject(
    locale: string,
    sim: string,
    reportObject: TranslationReportObject,
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
   * @param locale
   * @param sim
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
  public getObject( locale: string, sim: string ): TranslationReportObject | null {
    if ( this.cache[ locale ] !== undefined && this.cache[ locale ][ sim ] !== undefined ) {
      if ( this.cache[ locale ][ sim ].timestamp ) {
        const withinSimMetadataCacheWindow = Date.now() - this.cache[ locale ][ sim ].timestamp
                                             < publicConfig.VALID_METADATA_DURATION;
        if ( !this.cache[ locale ][ sim ].isDirty || ( this.cache[ locale ][ sim ].isDirty && withinSimMetadataCacheWindow ) ) {
          return this.cache[ locale ][ sim ];
        }
      }
      else {
        logger.error( `ReportObjectCache: getObject: ${locale}/${sim} has no timestamp` );
      }

    }
    return null;
  }

  /**
   * @param locale
   * @param sim
   * @returns Whether the object was successfully flushed
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