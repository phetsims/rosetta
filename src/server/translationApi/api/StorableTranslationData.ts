// Copyright 2025, University of Colorado Boulder

/**
 * Type definition for translation data for a simulation and locale that can be easily serialized to JSON and stored in
 * long- or short-term storage.  This includes the data for all strings used in the simulation, including sim-specific,
 * shared, and common-code strings.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

type HistoryEntry = {
  userId: number;
  timestamp: number;
  oldValue: string;
  newValue: string;
  explanation?: string | null;
};

type TranslationValueEntry = {
  value: string;
  history: HistoryEntry[];
};

// Translation data for a single repo.  The keys are the string keys, the values are the translated strings and their
// history.
export type TranslationDataForRepo = Record<string, TranslationValueEntry>;

// The collection of translation data for all repos in a translation.  The keys are the repo names.
export type MultiRepoTranslationData = Record<string, TranslationDataForRepo>;

type StorableTranslationData = {
  locale: string;
  simName: string;
  multiRepoTranslationData: MultiRepoTranslationData;
};

export type { StorableTranslationData };