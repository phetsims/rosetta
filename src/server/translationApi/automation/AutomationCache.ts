// Copyright 2025, University of Colorado Boulder

/**
 * Define the automation cache class. At startup, we create an object based on this
 * class. As Rosetta gets requests for automating translations, they are cached in this object
 * cache. (It takes a while to get them.) These objects are sent to the client to retrieve
 * existing translations.
 *
 * TODO: Include AI model in the cache! https://github.com/phetsims/rosetta/issues/451
 *
 * @author Agustín Vallejo
 */

class AutomationCache {

  // Record from locale to sim to stringKey to translated value
  private cache: Record<string, Record<string, Record<string, string>>> = {};

  /**
   * @param locale
   * @param sim
   * @param stringKey
   * @param translation
   */
  public setObject(
    locale: string,
    sim: string,
    stringKey: string,
    translation: string
  ): void {
    if ( this.cache[ locale ] === undefined ) {
      this.cache[ locale ] = {};
    }
    if ( this.cache[ locale ][ sim ] === undefined ) {
      this.cache[ locale ][ sim ] = {};
    }
    this.cache[ locale ][ sim ][ stringKey ] = translation;
  }

  /**
   * @param locale
   * @param sim
   * @param stringKey
   * @returns The translated value for the given locale, sim, and stringKey
   */
  public getObject( locale: string, sim: string, stringKey: string ): string | null {
    if ( this.cache[ locale ] !== undefined && this.cache[ locale ][ sim ] !== undefined ) {
      const translation = this.cache[ locale ][ sim ][ stringKey ];
      if ( translation !== undefined ) {
        return translation;
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

export default AutomationCache;