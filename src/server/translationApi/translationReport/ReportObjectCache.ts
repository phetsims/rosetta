// Copyright 2022, University of Colorado Boulder

/**
 * Cache for translation report objects. This is used to cache the translation report objects so they don't have to be
 * rebuilt all the time, since it takes time and a bunch of requests to long-term storage to create them.  At startup,
 * we create an instance of this class. As Rosetta gets requests for report objects, they are cached here.
 *
 * On development mode, we also store the cache to a file so that it can be reused across server restarts.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 * @author John Blanco (PhET Interactive Simulations)
 */

import fs from 'fs';
import path from 'path';
import config from '../../../common/config.js';
import ReportObject from '../../../common/ReportObject.js';
import logger from '../logger.js';

// File path for persistent cache storage
const CACHE_FILE_PATH = path.resolve( 'reportObjectCache.log' );

class ReportObjectCache {

  private cache: Record<string, Record<string, ReportObject>> = {};

  /**
   * Load cache data from the persistent file if it exists
   */
  private loadFromFile(): void {
    if ( config.ENVIRONMENT === 'development' ) {
      try {
        if ( fs.existsSync( CACHE_FILE_PATH ) ) {
          const fileContent = fs.readFileSync( CACHE_FILE_PATH, 'utf8' );
          if ( fileContent.trim() ) {
            this.cache = JSON.parse( fileContent );
            logger.info( 'ReportPersistentCache: Loaded cache from file' );
          }
        }
      }
      catch( error ) {
        logger.error( 'ReportPersistentCache: Error loading cache from file:', error );
        this.cache = {};
      }
      this.dropStaleEntries();
    }
  }

  private dropStaleEntries(): void {
    const now = Date.now();
    for ( const locale in this.cache ) {
      for ( const sim in this.cache[ locale ] ) {
        if ( now - this.cache[ locale ][ sim ].timestamp >= config.VALID_METADATA_DURATION ) {
          delete this.cache[ locale ][ sim ];
          logger.info( `ReportPersistentCache: Dropped stale cache entry for ${locale}/${sim}` );
        }
      }
      // If the locale has no sims left, remove the locale entry as well
      if ( Object.keys( this.cache[ locale ] ).length === 0 ) {
        delete this.cache[ locale ];
      }
    }
    this.saveToFile();
  }

  /**
   * Save cache data to the persistent file
   */
  private saveToFile(): void {
    if ( config.ENVIRONMENT === 'development' ) {
      // In development mode, we persist the cache to a file so that it can be reused across server restarts.
      try {
        fs.writeFileSync( CACHE_FILE_PATH, JSON.stringify( this.cache, null, 2 ), 'utf8' );
        logger.info( 'ReportPersistentCache: Saved cache to file' );
      }
      catch( error ) {
        logger.error( 'ReportPersistentCache: Error saving cache to file:', error );
      }
    }
  }

  /**
   * Set the object in the cache. This is used to store the report object.
   * @param locale - two-letter locale code
   * @param sim - sim name in kebab case, e.g. 'energy-skate-park'
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

    this.saveToFile();
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
    this.loadFromFile();
    let reportObject: ReportObject | null = null;
    if ( this.cache[ locale ] !== undefined && this.cache[ locale ][ sim ] !== undefined ) {
      const withinSimMetadataCacheWindow = Date.now() - this.cache[ locale ][ sim ].timestamp
                                           < config.VALID_METADATA_DURATION;
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
    this.saveToFile();
    return flushed;
  }
}

export default ReportObjectCache;