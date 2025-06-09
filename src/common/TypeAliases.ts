// Copyright 2025, University of Colorado Boulder

/**
 * Type alias definitions that are used on both the client and server sides of Rosetta.  These alias types are used to
 * add semantic meaning to the data structures used in Rosetta, making it easier to understand the purpose of each
 * type.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

// A string key is a string that is used to identify a particular string in the source and translation files.
export type StringKey = string;

// A string value is a string that represents the value of a string key in the source or translation files.
export type StringValue = string;

// The name of a repository (repo) in kebab-case where strings are coming from or for which translations are being
// submitted.  Examples: 'joist', 'build-an-atom', 'scenery-phet'.
export type RepoName = string;

// A locale is a string that represents a language and region, and as of this writing (June 2025) Rosetta uses the
// format defined in ISO 639-1 with two lower case letters for language and an optional additional two upper case
// letters for the country, e.g. 'en' for English, 'es' for Spanish, 'fr_CA' for French as spoken in Canada.
export type Locale = string;