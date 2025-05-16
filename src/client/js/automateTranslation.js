// Copyright 2025, University of Colorado Boulder

/**
 * Creates an automatic translation of the text using the server-side automated translation endpoint.
 *
 * @author Agustín Vallejo
 */


import { TRANSLATION_API_ROUTE } from '../../common/constants.js';
import logError from './logError.js';

/**
 * Function to translate text using the server-side automated translation endpoint.
 * @param {String} locale - The target language code
 * @param {String} simName - The name of the simulation being translated
 * @param {String} stringKey - The key for the string in the translation form
 * @param {String} textToTranslate - The text to translate
 * @returns {Promise<String>} - The translated text
 */
const translateWithAI = async ( locale, simName, stringKey, textToTranslate ) => {
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
      logError( 'Error translating via server:', errMsg );
      return 'ERROR';
    }
    return await res.json();
  }
  catch( error ) {
    logError( 'Error translating via server:', error );
    throw error;
  }
};

/**
 * Automates the translation of all strings and updates the values object.
 * @param {Object} values - The values in the translation form
 * @param {String} simName - The name of the simulation being translated
 * @param {String} locale - The locale code of the simulation being translated
 * @param {String} simTitle - The simulation title
 * @param {String} localeName - The name of the language/locale
 * @param {Function} setFieldValue - Function to update the form field values
 * @returns {Promise<Object|null>} - The status of the translation submission
 */
const automateTranslation = async (
  values,
  simName,
  locale,
  simTitle,
  localeName,
  setFieldValue
) => {
  const translatedValues = { ...values };  // Create a copy of the original values object

  // Track which fields have been automatically translated
  const updatedPaths = [];

  // Iterate through the values and translate any missing 'translated' fields
  const translateFields = async ( obj, path = '' ) => {
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
            translateWithAI( localeName, simName, path, textToTranslate )
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
      await translateFields( translatedValues[ key ], key + '.' );
    }
  }

// Then process all other keys not in the order
  for ( const key of Object.keys( translatedValues ) ) {
    if ( !order.includes( key ) ) {
      await translateFields( translatedValues[ key ], key + '.' );
    }
  }

  // After translation, we can send the translated values to the server or handle them further
  console.log( 'Translated Values:', translatedValues );
  // Return list of fields that were automatically translated
  return updatedPaths;
};

export default automateTranslation;