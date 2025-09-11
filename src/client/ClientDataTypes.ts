// Copyright 2025, University of Colorado Boulder

/**
 * Shared type definitions for the data structures used in the Rosetta client.
 *
 * @author Agustín Vallejo
 * @author John Blanco (PhET Interactive Simulations)
 */

import ReportObject from '../common/ReportObject.js';
import { TranslationFormData } from '../common/TranslationFormData.js';

export type SimNamesAndTitles = Record<string, string>;

export type TranslationFormValues = {
  [ key: string ]: string | boolean | TranslationFormValues;
};

type LocaleAndAIMetadata = {
  locale: string;
  aiTranslatedFields: Set<string> | null;
  setAiTranslatedFields: ( fields: Set<string> ) => void;
};

export type TranslationFormTablesProps = {
  translationFormData: TranslationFormData;
  hideTranslated: boolean;
} & LocaleAndAIMetadata;

export type TranslationFormRowProps = {
  keyWithoutDots: string;
  name: string;
  stringKey: string;
  englishString: string;
  hideTranslated: boolean;
  hasTranslation: boolean;
} & LocaleAndAIMetadata;

export type ErrorContextType = Record<string, string> | null;

// Below types used for the TranslationFormRow component.
export type LocaleInfo = Record<string, {
  name: string;
  direction: 'ltr' | 'rtl';
}>;

// This type represents a ReportObject after its percentages have been calculated/re-calculated
// by `getReportObjectsWithCalculatedPercentages`. These calculated percentages
// are specifically named `commonPercent`, `simSpecificPercent`, and `sharedPercent` in the original logic.
// They effectively override or provide the definitive values for sorting and display.
export type ReportObjectWithCalculatedPercentages = ReportObject & {
  commonPercent: number; // The calculated common percentage
  simSpecificPercent: number; // The calculated sim-specific percentage
  sharedPercent: number; // The calculated shared percentage
  totalPercent: number; // Optional total percentage, if applicable
};