// Copyright 2025, University of Colorado Boulder

/**
 * Type definition for translation form data.  This is the data structure that is used to populate the translation form
 * the is shown to the user, and also the data that is sent to the server when the user submits the form.
 *
 * TODO: See https://github.com/phetsims/rosetta/issues/311.  As of this writing (April 7 tot5), I (jbphet) don't think
 *       the data sent to the server is exactly the same as as that used by the server to save and load translations, so
 *       I'll need to reconcile the two.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

type StringEntry = {
  english: string;
  translated: string;
};

type CommonStringEntry = StringEntry & {
  repo: string;
};

type SharedStringEntry = StringEntry & {
  repo: string;
};

type TranslationFormData = {

  // string keys and values for the sim-specific strings
  simSpecific: Record<string, StringEntry>;

  // string keys and values for shared strings, such as those in shared repos that are not common code
  shared: Record<string, SharedStringEntry>;

  // string keys and values for common code strings, such as those in joist, sun, etc.
  common: Record<string, CommonStringEntry>;

  // whether this sim is a prototype
  simIsPrototype: boolean;
};

export type { TranslationFormData };