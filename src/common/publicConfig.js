// Copyright 2022, University of Colorado Boulder

/**
 * This module exports Rosetta's public config object. We need some configuration on the client, but we wouldn't want
 * secret values available on the client.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

export default {

  // Determines whether the user will see the "down for maintenance" page or the translation utility.
  IS_ENABLED: true,

  // Where to get website user data. Used for checking if someone is logged in, if they
  // are a trusted translator, etc. The website user data URL is undergoing some flux as
  // of December 2022, hence the following:
  // production future: https://phet-direct.colorado.edu/user/check-login,
  // production current: https://phet.colorado.edu/services/check-login,
  // dev current: https://phet-direct-dev.colorado.edu/user/check-login,
  // localhost current: http://localhost:16372/services/check-login,
  WEBSITE_USER_DATA_URL: 'http://localhost:16372/services/check-login',

  // Set this to production if you're in production. Set this to development if you're
  // in development.
  ENVIRONMENT: 'development',

  // A dummy user ID only used if you have your environment variable set to development.
  LOCAL_USER_ID: '654321',

  // Determines how long you want to cache sim metadata before getting it fresh. Sim
  // metadata is a big chunk of data, so we cache it.
  // 60 min * 60 s/min * 1000 ms/s = 360,000 ms
  VALID_METADATA_DURATION: 3600000,

  singleBraceRegex: /\{\d+\}/g,
  doubleBraceRegex: /\{\{\w+\}\}/g,
  translationApiRoute: '/translate/api'
};