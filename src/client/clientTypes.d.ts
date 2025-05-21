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