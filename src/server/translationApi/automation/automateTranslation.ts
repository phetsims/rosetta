// Copyright 2025, University of Colorado Boulder
/**
 * Automatically translate a given text using OpenAI's API.
 *
 * @author Agustín Vallejo
 */


import { Request, Response } from 'express';
import { OpenAI } from 'openai'; // OpenAI SDK
import privateConfig from '../../../common/privateConfig.js';
import logger from '../logger.js';
import { automationCache } from '../translationApi.js';

const client = new OpenAI( {
  apiKey: privateConfig.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
} );

// This flag and function used for testing to avoid making many calls to the OpenAI API
const MOCK_TRANSLATE = true;
const sleep = ( ms: number ) =>
  new Promise<void>( resolve => setTimeout( resolve, ms ) );
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
    res.json( {
      translation: `**${cachedTranslation}`
    } );
    return;
  }

  // Simulate the API call. Used only for testing.
  if ( MOCK_TRANSLATE ) {
    // This is a mock translation function that reverses the string but preserves {} structure.
    const mockTranslatedText = mockTranslate( textToTranslate );
    await sleep( 0 );
    res.json( {
      translation: mockTranslatedText,
      model: 'mock-model'
    } );
    automationCache.setObject( locale, simName, stringKey, mockTranslatedText );
    return;
  }

  // Construct prompt for OpenAI
  const prompt = `
    Translate from English to ${locale}. The strings belong to a STEM educational simulation about ${simName},
    so in case of doubt, use a related scientific term. Respect the title casing when translating
    (i.e. 'Number of Atoms' should go to 'Número de Átomos' and so on) and respect the bracket notation and format {{}}.
    And preserve the key within brackets, i.e {{numberOfAtoms}} should NOT be translated.
    If for some reason you cannot translate a string, please return the original string. Do not add any extra text or
    explanation, just return the translation.\n\n
    The following is the string to translate:\n
    `;

  try {
    const model = 'gpt-4o';
    const completion = await client.chat.completions.create( {
      model: model,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: textToTranslate }
      ]
    } );

    const translatedValue = completion.choices[ 0 ].message.content!.trim();
    res.json( {
      translation: translatedValue,
      model: model
    } );
    automationCache.setObject( locale, simName, stringKey, translatedValue );
  }
  catch( error ) {
    logger.error( 'Error in automateTranslation endpoint:', error );
    throw error;
  }
};

export default automateTranslation;