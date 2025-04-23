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

const client = new OpenAI( {
  apiKey: privateConfig.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
} );

const MOCK_TRANSLATE = true;
const sleep = ( ms: number ) =>
  new Promise<void>( resolve => setTimeout( resolve, ms ) );

const automateTranslation = async ( req: Request, res: Response ): Promise<void> => {
  logger.info( 'Began automatic translation request' );
  const { text, simName, locale } = req.body;
  if ( typeof text !== 'string' || typeof simName !== 'string' || typeof locale !== 'string' ) {
    res.status( 400 ).json( { error: 'Missing or invalid parameters: text, simName, locale are required.' } );
    return;
  }

  if ( MOCK_TRANSLATE ) {
    await sleep( 100 );
    res.json( {
      translation: text
    } );
    return;
  }

  // Construct prompt for OpenAI
  const prompt = `
    Translate from English to ${locale}. The strings belong to a STEM educational simulation about ${simName},
    so in case of doubt, use a related scientific term. Respect the title casing when translating
    (i.e. 'Number of Atoms' should go to 'Número de Átomos' and so on) and respect the bracket notation and format {{}}.
    If for some reason you cannot translate a string, please return the original string. Do not add any extra text or
    explanation, just return the translation.\n\n
    The following is the string to translate:\n
    `;

  try {
    const completion = await client.chat.completions.create( {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: text }
      ]
    } );

    const result = completion.choices[ 0 ].message.content!.trim();
    console.log( text, result );
    res.json( {
      translation: result
    } );
  }
  catch( error ) {
    logger.error( 'Error in automateTranslation endpoint:', error );
    throw error;
  }
};

export default automateTranslation;