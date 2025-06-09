// Copyright 2025, University of Colorado Boulder

/**
 * Type definition for translation form data.  This is the data structure that is used to populate the translation form
 * the is shown to the user, and also a portion of the data that is sent to the server when the user submits the form.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import { RepoName, StringKey, StringValue } from './TypeAliases.js';

export type StringEntry = {
  english: StringValue;
  translated: StringValue;
};

// An object with keys for strings and both the English and translated values for each.
export type SimSpecificTranslationFormStrings = Record<StringKey, StringEntry>;

// An object with keys for strings, values for both the English and translated values, and the repo name where the
// string is defined.  The repo name is needed because these strings can come from multiple repos.
export type StringEntryWithRepo = StringEntry & {
  repo: RepoName;
};
export type CommonAndSharedTranslationFormStrings = Record<StringKey, StringEntryWithRepo>;

// A type that represents all strings used for a particular sim categorized into sim-specific, shared, and common code.
type TranslationFormData = {

  // keys and values for the sim-specific strings
  simSpecific: SimSpecificTranslationFormStrings;

  // keys and values for shared strings, such as those in shared repos that are not common code
  shared: CommonAndSharedTranslationFormStrings;

  // keys and values for common code strings, such as those in joist, sun, etc.
  common: CommonAndSharedTranslationFormStrings;

  // whether this sim is a prototype
  simIsPrototype: boolean;
};

export type { TranslationFormData };