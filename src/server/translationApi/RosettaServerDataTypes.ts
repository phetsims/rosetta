// Copyright 2025, University of Colorado Boulder

/**
 * Type definitions for that data structures that are used in the Rosetta server and that don't have a clear home in
 * other files.  These types represent the data that stays within the server.  Types that are exchanged between the
 * server and the client or used exclusively on the client are defined elsewhere.
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

// An object that matches string keys to their values.  The values can be English strings or translated strings.
export type StringKeysAndValues = Record<StringKey, StringValue>;

// The English strings, which are the source strings used in the sim and common-code repos.
export type EnglishStrings = Record<StringKey, { value: StringValue }>;

// History entry data exists only in the translation files, not the original English source files.  It keeps track of
// the changes made to each string in the translation files.
export type HistoryEntry = {

  // The numeric user ID of the user who made the change.
  userId: number;

  // The time at which the change was made, in milliseconds since the epoch.
  timestamp: number;

  // The previous value of the string.
  oldValue: string;

  // The new value of the string that is being submitted by the user.
  newValue: string;

  // TODO: Can we remove this?  See https://github.com/phetsims/rosetta/issues/468.
  // An optional explanation of the motivation for the change, if provided by the user.
  explanation?: string | null;

  // The translation value suggested by the AI, if any.
  aiSuggestedValue?: string;

  // If true, this indicates that the string value was fully translated by AI. If false, it means that the AI-suggested
  // value was rejected or edited.  If not present it is assumed to be false.
  aiTranslated?: boolean;

  // The model used by the AI to generate the suggestion, if applicable, e.g. 'gpt-3.5-turbo'.
  aiModel?: string;
};

// Type for a single entry in the translation data.  It contains the value of the string and its history.
export type TranslationValueEntry = {
  value: StringValue;
  history: HistoryEntry[];
};

// Translation data for a single repo.  The keys are the string keys, the values are the translated strings and their
// history.  This is essentially the format of the data that is stored in the translation JSON files.
export type TranslationDataForRepo = Record<StringKey, TranslationValueEntry>;

// The collection of translation data for all strings used in a translation.  Since a translation generally consists of
// strings from multiple repos, this is a mapping of repo names to their translation data.
export type MultiRepoTranslationData = Record<RepoName, TranslationDataForRepo>;

// The full set of data that makes up a translation for a simulation.
type SimTranslationData = {

  // The name of the simulation for which this translation was submitted, e.g. 'area-model-algebra'.
  simName: string;

  // The locale for the translation, e.g. 'es' for Spanish.
  locale: string;

  // All the repo & string keys & strings that represent the translation.
  multiRepoTranslationData: MultiRepoTranslationData;
};

export type { SimTranslationData };