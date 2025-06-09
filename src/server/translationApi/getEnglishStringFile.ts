// Copyright 2023, University of Colorado Boulder

/**
 * Export a reusable function, see function header below.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 * @author John Blanco (PhET Interactive Simulations)
 */

import { Octokit } from '@octokit/rest';
import privateConfig from '../../common/privateConfig.js';
import logger from './logger.js';
import { EnglishStrings } from './ServerDataTypes.js';

const octokit = new Octokit( { auth: privateConfig.GITHUB_PAT } );

// This type defines a string key to value entry that is potentially nested.  As of this writing (June 2025), this only
// applies to English string files.  Translation files do not have nested values.
type PotentiallyNestedStringValue = { value: string } | { [ key: string ]: PotentiallyNestedStringValue };

// Type definition for the content of English string files.  These don't have history the way translation files do, and
// can potentially contain nested values.
type EnglishStringFileContents = Record<string, PotentiallyNestedStringValue>;

/**
 * Get the contents of the English language string file for a given repo and, optionally, the specified branch.
 *
 * @param simOrLibRepo - repository where the strings come from
 * @param [ref] - branch or SHA of commit to get the string file from
 * @returns string file contents
 */
const getEnglishStringFile = async ( simOrLibRepo: string, ref = 'main' ): Promise<EnglishStrings> => {
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
  result: EnglishStrings = {}
): EnglishStrings {

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

export default getEnglishStringFile;