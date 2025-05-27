// Copyright 2025, University of Colorado Boulder

/**
 * Type definition for the translation form values. This is the data structure that is used to represent the
 * translation form in the client-side code.
 *
 * @author Agustín Vallejo
 */

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

// Report Object used widely
// TODO: HIGHLY improvable https://github.com/phetsims/rosetta/issues/311
export type ReportObject = {
  simTitle: string;
  percentSimSpecific: number;
  numSimSpecificTranslatedStrings: number;
  numSimSpecificStrings: number;
  percentShared: number;
  numSharedTranslatedStrings: number;
  numSharedStrings: number | null;
  percentCommon: number;
  numCommonTranslatedStrings: number;
  numCommonStrings: number;
  simName: string;
  isDirty: boolean;
  totalTranslatedStrings: number;
  totalStrings: number;
  percentTotal: number;

  key?: string;
  type?: string;
  locale?: string;
  untranslated?: boolean;
  translation?: string;
  stats?: {
    totalKeys: number;
    translatedKeys: number;
    untranslatedKeys: number;
    percentageTranslated: number;
  };

  [ key: string ]: string | number | boolean | { [ key: string ]: number } | null; // Allow for additional properties that may be added later
};