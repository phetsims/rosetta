// Copyright 2023, University of Colorado Boulder

/**
 * Get a string file for a given repo and locale.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { Octokit } from '@octokit/rest';
import privateConfig from '../../common/privateConfig.js';
import logger from './logger.js';
import { TranslationDataForRepo } from './StorableTranslationData.js';

// This type defines a string key to value entry that is potentially nested.
type PotentiallyNestedStringValue = { value: string } | { [ key: string ]: PotentiallyNestedStringValue };

// Type definition for English string files.  These done have history the way translations do, and can potentially
// contain nested values.
// TODO: Move this to shared types file and consolidate with other non-translated file types, see https://github.com/phetsims/rosetta/issues/311.
export type EnglishStringFileContents = Record<string, PotentiallyNestedStringValue>;

const octokit = new Octokit( { auth: privateConfig.GITHUB_PAT } );

/**
 * Return the contents of the string file.
 *
 * @param simOrLibRepo - repository where the strings come from
 * @param ref - branch or SHA of commit to get the string file from
 * @returns string file
 */
const getStringFile = async ( simOrLibRepo: string, ref = 'main' ): Promise<TranslationDataForRepo> => {
  let stringFile = {};
  try {
    const response = await octokit.repos.getContent( {
      owner: 'phetsims',
      repo: simOrLibRepo,
      path: `${simOrLibRepo}-strings_en.json`,
      ref: ref
    } );
    if ( 'content' in response.data && response.data.content ) {
      const content = Buffer.from( response.data.content, 'base64' ).toString( 'utf-8' );

      // Convert the JSON content to an object, and also flatten it such that nested string values are changed to be
      // non-nested.
      stringFile = flattenObject( JSON.parse( content ) );
    }
  }
  catch( e ) {
    logger.error( e );
  }
  return stringFile;
};

/**
 * Flatten a strings file object such that all string values are at the top level of the object.  So, for example, an
 * entry like this:
 *
 *   a11y: {
 *     keyboardHelp: {
 *       keyboardShortcuts: {
 *         value: "Keyboard Shortcuts"
 *       }
 *     }
 *   }
 *
 * ...would become:
 *
 *   a11y.keyboardHelp.keyboardShortcuts: {
 *     value: "Keyboard Shortcuts"
 *   }
 */
function flattenObject(
  obj: EnglishStringFileContents,
  parentKey = '',
  result: EnglishStringFileContents = {}
): EnglishStringFileContents {

  for ( const key in obj ) {
    if ( obj.hasOwnProperty( key ) ) {
      const newKey = parentKey ? `${parentKey}.${key}` : key;

      if (
        obj[ key ] !== null &&
        typeof obj[ key ] === 'object' &&
        !Array.isArray( obj[ key ] ) &&
        'value' in obj[ key ]
      ) {

        // If this object has a 'value' key, treat it as a leaf.
        result[ newKey ] = { value: obj[ key ].value as string };
      }
      else if (
        typeof obj[ key ] === 'object' &&
        obj[ key ] !== null &&
        !Array.isArray( obj[ key ] )
      ) {

        // Recurse into objects that don't yet have 'value' as a key.
        flattenObject( obj[ key ], newKey, result );
      }
      else {

        // For non-object values
        result[ newKey ] = obj[ key ];
      }
    }
  }
  return result;
}

export default getStringFile;