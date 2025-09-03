// Copyright 2025, University of Colorado Boulder

/**
 * Creates an automatic translation of the text using the server-side automated translation endpoint.
 *
 * @author Agustín Vallejo
 */


import { TRANSLATION_API_ROUTE } from '../../common/constants';
import { TranslationFormValues } from '../ClientDataTypes.js';
import logError from './logError';

type TranslationResponse = {
  translation: string;
  model: string;
};

/**
 * Function to translate text using the server-side automated translation endpoint.
 */
const translateWithAI = async (
  locale: string,
  simName: string,
  stringKey: string,
  textToTranslate: string
): Promise<TranslationResponse> => {
  try {
    const res = await fetch(
      `${TRANSLATION_API_ROUTE}/automateTranslation`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( {
          locale: locale,
          simName: simName,
          stringKey: stringKey,
          textToTranslate: textToTranslate
        } )
      }
    );
    if ( !res.ok ) {
      const errMsg = res.statusText;
      await logError( 'Error translating via server: ' + errMsg );
    }
    return await res.json();
  }
  catch( error ) {
    await logError( 'Error translating via server: ' + error );
    throw error;
  }
};

/**
 * Automates the translation of all strings and updates the values object.
 */
const automateTranslation = async (
  translatedValues: TranslationFormValues,
  simName: string,
  locale: string,
  simTitle: string,
  localeName: string,
  setFieldValue: ( fieldPath: string, value: string | boolean ) => void
): Promise<string[]> => {
  // Track which fields have been automatically translated
  const updatedPaths: string[] = [];

  // Iterate through the values and translate any missing 'translated' fields
  const translateFields = async ( obj: TranslationFormValues, path = '' ) => {
    const updates = []; // Store promises to update each translated field

    for ( const key in obj ) {
      if ( obj[ key ] && typeof obj[ key ] === 'object' ) {
        // Recurse if the value is an object
        await translateFields( obj[ key ], path + key + '.' );
      }
      else if ( key === 'translated' && !obj[ key ] ) {
        // If the 'translated' field is empty, translate the 'english' value
        const textToTranslate = obj.english;
        if ( textToTranslate ) {
          // Add the async operation to the updates array
          updates.push(
            translateWithAI( localeName, simName, path, textToTranslate as string )
              .then( data => {
                const model = data.model;
                const translatedText = data.translation.trim();

                // If no translation was provided, don't mark as updated (won't show the revision buttons)
                if ( translatedText === '' ) {
                  return;
                }

                const fieldPath = `${path}${key}`;
                // Update the translated field
                setFieldValue( fieldPath, translatedText );
                // Update AI metadata fields in Formik values
                setFieldValue( `${path}aiSuggestedValue`, translatedText );
                setFieldValue( `${path}aiTranslated`, true );
                setFieldValue( `${path}aiModel`, model );
                // Update local copy for consistency
                obj[ key ] = translatedText;
                obj.aiSuggestedValue = translatedText;
                obj.aiTranslated = true;
                obj.aiModel = model;

                // Record this field as AI-translated
                updatedPaths.push( fieldPath );
              } )
              .catch( error => {
                console.error( `Error translating ${path}${key}:`, error );
                obj[ key ] = `Error translating ${path}${key}`;  // Add error handling text
              } )
          );
        }
      }
    }

    // Wait for all translation promises to complete
    await Promise.all( updates );
  };


  // Define the explicit order
  const order = [ 'simSpecific', 'shared', 'common' ];

  // First process simSpecific, shared, common
  for ( const key of order ) {
    if ( translatedValues[ key ] !== undefined ) {
      await translateFields( translatedValues[ key ] as TranslationFormValues, key + '.' );
    }
  }

  // Then process all other keys not in the order
  for ( const key of Object.keys( translatedValues ) ) {
    if ( !order.includes( key ) ) {
      await translateFields( translatedValues[ key ] as TranslationFormValues, key + '.' );
    }
  }

  // After translation, we can send the translated values to the server or handle them further
  console.log( 'Translated Values:', translatedValues );
  // Return list of fields that were automatically translated
  return updatedPaths;
};

export default automateTranslation;