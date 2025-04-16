// Copyright 2025, University of Colorado Boulder

/**
 * Type definition for the translation data that is sent from the client side to the server when the user submits a
 * translation for publication.  This defines the structure of the data that is essentially sent "over the wire".
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import { TranslationFormData } from './TranslationFormData.js';

type ClientSubmittedTranslationData = {
  locale: string;
  simName: string;
  userId: number;
  timestamp: number;
  translationFormData: TranslationFormData;
};

export type { ClientSubmittedTranslationData };