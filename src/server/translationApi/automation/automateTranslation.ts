// Copyright 2025, University of Colorado Boulder
/**
 * Automatically translate a given text using OpenAI's API.
 *
 * @author Agustín Vallejo
 */


import { Request, Response } from 'express';
import config from '../../../common/config.js';
import logger from '../logger.js';
import { automationCache } from '../translationApi.js';

// Return types for the Open Router fetch function
type OpenRouterResponse = {
  choices: ( NonStreamingChoice )[];
};

type NonStreamingChoice = {
  message: {
    content: string | null;
  };
};

// This flag and function used for testing to avoid making many calls to the OpenAI API
const mockTranslate = ( text: string ): string => {
  // This is a mock translation function that reverses the string, except ones that have {
  return text.includes( '{' ) ? text : text
    .split( '' )
    .reverse()
    .join( '' );
};

const automateTranslation = async ( req: Request, res: Response ): Promise<void> => {
  const { locale, simName, stringKey, textToTranslate } = req.body;
  if (
    typeof locale !== 'string' ||
    typeof simName !== 'string' ||
    typeof stringKey !== 'string' ||
    typeof textToTranslate !== 'string'
  ) {
    res.status( 400 ).json( { error: 'Missing or invalid parameters: locale, simName, stringKey and text are required.' } );
    return;
  }

  // Check for existing translations in the cache
  const cachedTranslation = automationCache.getObject( locale, simName, stringKey );
  if ( cachedTranslation !== null ) {
    logger.info( 'Automation cache value found, using it.' );
    res.json( {
      translation: `${cachedTranslation}`
    } );
    return;
  }

  // If we'll fake the automatic translation, use the mockTranslate function
  if ( config.FAKE_AUTOMATIC_TRANSLATION ) {
    // This is a mock translation function that reverses the string but preserves {} structure.
    const mockTranslatedText = mockTranslate( textToTranslate );
    res.json( {
      translation: mockTranslatedText,
      model: 'fake-model'
    } );
    return;
  }
  else if ( !config.OPENROUTER_API_KEY ) {
    // If we use the real automatic translation, make sure the API key is set
    res.json( {
      translation: '',
      model: ''
    } );
    logger.error( 'No OpenRouter API key provided. Please set the OPENROUTER_API_KEY environment variable.' );
    return;
  }

  // Construct prompt for OpenAI
  const prompt = `
    Translate from English to ${locale}. The strings belong to a STEM educational simulation about ${simName},
    so in case of doubt, use a related scientific term. Respect the title casing when translating
    (i.e. 'Number of Atoms' should go to 'Número de Átomos' and so on) and respect the bracket notation and format {{}}.
    And preserve the key within brackets, i.e {{numberOfAtoms}} should NOT be translated.
    If the string is a single letter, return the same letter in the target language if possible.
    Make sure the string length is similar to the original string, so it fits in the UI.
    If for some reason you cannot translate a string, please return the original string. Do not add any extra text or
    explanation, just return the translation.\n\n
    The following is the string to translate:\n
    ${textToTranslate}
    `;

  try {
    // Go to https://openrouter.ai/rankings/translation?view=week to compare the current best model for translation
    const model = 'google/gemini-2.0-flash-001';
    const response = await fetch( 'https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify( {
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      } )
    } );

    try {
      const data = await response.json() as OpenRouterResponse;
      const translatedValue = data.choices[ 0 ].message.content;

      res.json( {
        translation: translatedValue,
        model: model
      } );
      automationCache.setObject( locale, simName, stringKey, translatedValue! );
    }
    catch( e ) {
      res.json( {
        translation: '', // Sending empty translation if there's an error retrieving the translated value
        model: model
      } );
      logger.error( 'Error parsing OpenRouter response:', e );
    }
  }
  catch( error ) {
    logger.error( 'Error in automateTranslation endpoint:', error );

    // If we will use the real automatic translation, make sure the API key is set
    res.json( {
      translation: '',
      model: ''
    } );
  }
};

export default automateTranslation;