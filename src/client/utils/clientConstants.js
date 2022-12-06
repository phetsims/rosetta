// Copyright 2022, University of Colorado Boulder

/**
 * Export an object containing constants used in the client-side code.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

export default {
  singleBraceRegex: /\{\d+\}/g,
  doubleBraceRegex: /\{\{\w+\}\}/g,
  translationApiRoute: '/translate/api',
  numberOfShortReportEvents: 3 // WARNING: Set to null in production!
};