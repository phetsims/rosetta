// Copyright 2025, University of Colorado Boulder

/**
 * Type definition for the translation form values. This is the data structure that is used to represent the
 * translation form in the client-side code.
 *
 * @author Agustín Vallejo
 */

export type TranslationFormValues = {
  [ key: string ]: string | boolean | TranslationFormValues;
};

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

export type TranslationValues = {
  [ keyType: string ]: { // simSpecific, shared, common
    [ stringKey: string ]: {
      translated: string;
      english: string;
    };
  };
};

// Types for TranslationFormTables
export type TranslationFormData = {
  [ keyType: string ]: {
    [ stringKeyWithoutDots: string ]: {
      english: string;
    };
  };
} & {
  simIsPrototype: boolean;
};

export type TranslationFormTablesProps = {
  translationFormData: TranslationFormData;
  locale: string;
  aiTranslatedFields: string[];
  setAiTranslatedFields: ( fields: string[] ) => void;
};

// Below types used for the TranslationFormRow component
export type LocaleInfo = {
  [locale: string]: {
    name: string;
    direction: 'ltr' | 'rtl';
  };
};

export type TextAreaStyle = {
  textAlign: 'left' | 'right';
  color: string;
  resize: 'both';
};

export type TranslationFormRowProps = {
  keyWithoutDots: string;
  name: string;
  stringKey: string;
  englishString: string;
  locale: string;
  aiTranslatedFields: Set<string> | null;
  setAiTranslatedFields: ( fields: Set<string> ) => void;
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