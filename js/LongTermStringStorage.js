// Copyright 2017, University of Colorado Boulder

/**
 * This file defines a singleton object that is used for long term storage of the translated strings.  It is called
 * "long term" to distinguish it from the short term storage that can occur if a user decides to save a translation
 * without submitting it.
 *
 * This implementation uses GitHub as the "back end" where the strings are stored, but it is intended to be a fairly
 * generic interface so that if we ever decide to use something else as the storage medium for strings, this could be
 * rewritten without impacting portions of the code.  That's the idea anyway.
 */

/* eslint-env node */
'use strict';

// modules
var winston = require( 'winston' );

module.exports = {
  getStringSet: function( locale, repo ){
  },

  stringSetExists: function( locale, repo ){
    winston.log( 'info', 'stringSetExists called' );
  }
};