// Copyright 2025, University of Colorado Boulder

/**
 * Creates an automatic translation of the text using OpenAI's API.
 *
 * @author Agustín Vallejo
 */

import { OpenAI } from 'openai'; // OpenAI SDK

const key = import.meta.env.VITE_OPENAI_API_KEY;

const client = new OpenAI( {
  apiKey: key,
  dangerouslyAllowBrowser: true
} );

/**
 * Function to translate text using OpenAI
 * @param {String} text - The text to translate
 * @param {String} simName - The name of the simulation being translated
 * @param {String} locale - The target language code
 * @returns {Promise<String>} - The translated text
 */
const translateWithOpenAI = async ( text, simName, locale ) => {
  const prompt = `
    Translate from English to ${locale}. The strings belong to a STEM educational simulation about ${simName}, 
    so in case of doubt, use a scientific term. Respect the title casing when translating 
    (i.e. 'Number of Atoms' should go to 'Número de Átomos' and so on). If for some reason you cannot translate a string,
    please return the original string. Do not add any extra text or explanation, just return the translation.
   
    The following is the string to translate: \n
  `;

  try {
    const completion = await client.chat.completions.create( {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: text }
      ]
    } );

    const result = completion.choices[ 0 ].message.content.trim();
    console.log( text, result );
    return result;
  }
  catch( error ) {
    console.error( 'Error translating with OpenAI:', error );
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
 * @returns {Promise<Object|null>} - The status of the translation submission
 */
const automateTranslation = async (
  values,
  simName,
  locale,
  simTitle,
  localeName
) => {
  const translatedValues = { ...values };  // Create a copy of the original values object

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
            translateWithOpenAI( textToTranslate, simName, localeName ).then( translatedText => {
              obj[ key ] = translatedText;  // Update the 'translated' field once done
            } ).catch( error => {
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


  // Start translating the values object
  await translateFields( translatedValues );

  debugger; // eslint-disable-line no-debugger

  // After translation, we can send the translated values to the server or handle them further
  console.log( 'Translated Values:', translatedValues );

  return translatedValues;
};

export default automateTranslation;