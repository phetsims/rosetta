// Copyright 2025, University of Colorado Boulder

/**
 * Type definition for the translation form values. This is the data structure that is used to represent the
 * translation form in the client-side code.
 *
 * @author Agustín Vallejo
 */

import ReportObject from '../common/ReportObject.js';
import { StringEntry } from '../common/TranslationFormData.js';

export type SimNamesAndTitles = {
  [ simName: string ]: string;
};

// For getWebsiteUserData and others
export type WebsiteUserData = {
  loggedIn: boolean;
  userId: number | string; // some servers use a string for userId https://github.com/phetsims/rosetta/issues/373
  username?: string;
  email?: string;
  teamMember?: boolean;
  trustedTranslator?: boolean;
  translatorLocales?: string[] | null;
  subscribed?: boolean;
};

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
} & LocaleAndAIMetadata;

export type TranslationFormRowProps = {
  keyWithoutDots: string;
  name: string;
  stringKey: string;
  englishString: string;
} & LocaleAndAIMetadata;

// Types for TranslationFormTables
export type TranslationFormData = {
  [ keyType: string ]: { // simSpecific, shared, common
    [ stringKeyWithoutDots: string ]: StringEntry;
  };
  simIsPrototype: boolean;
  errors: ErrorContextType; // errors for the form, if any
};

// TODO: Try to use Record https://github.com/phetsims/rosetta/issues/311
export type ErrorContextType = {
  [ key: string ]: string;
} | null;

// Below types used for the TranslationFormRow component
export type LocaleInfo = {
  [locale: string]: {
    name: string;
    direction: 'ltr' | 'rtl';
  };
};

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