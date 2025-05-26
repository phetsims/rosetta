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