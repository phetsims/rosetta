// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a shared function, see header for details.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { NO_LONGER_USED_FLAG } from '../../../common/constants.js';
import { StringKey, StringValue } from '../../../common/TypeAliases.js';
import { CategorizedStringKeys } from '../getCategorizedStringKeys.js';
import getCommonRepos from '../getCommonRepos.js';
import getEnglishStringFile from '../getEnglishStringFile.js';
import logger from '../logger.js';
import { StringKeysAndValues } from '../ServerDataTypes.js';

// This type format matches the structure of the English string files that are used in the sim and common-code repos.
// It omits things like history, which are only present in the translation files.
type StringFileContents = Record<StringKey, { value: StringValue }>;

/**
 * Get an object where the keys are common English string keys used in a simulation and the values are the English
 * values of the string. Note that this does NOT indicate which repo the string is from.
 *
 * @param simName - sim name
 * @param simNames - list of all sim names
 * @param categorizedStringKeys - string keys categorized into common and sim-specific
 * @param stringKeysWithRepoName - string keys with their respective repo names for the specified sim
 * @returns A promise resolving to an object with common English string keys and their values
 */
const getCommonEnglishStringKeysAndValues = async ( simName: string,
                                                    simNames: string[],
                                                    categorizedStringKeys: CategorizedStringKeys,
                                                    stringKeysWithRepoName: string[] ): Promise<StringKeysAndValues> => {

  logger.info( `getting ${simName}'s common English string keys and values` );
  const commonEnglishStringKeysAndValues: StringKeysAndValues = {};

  try {

    // For each common repo, get the string file contents.
    const commonRepos = await getCommonRepos( simName, simNames, stringKeysWithRepoName );
    const stringFiles: StringFileContents[] = [];
    for ( const repo of commonRepos ) {
      stringFiles.push( await getEnglishStringFile( repo ) );
    }

    // For each common string key, find its value in one of the string files.
    const commonStringKeys = categorizedStringKeys.common;
    for ( const stringKey of commonStringKeys ) {

      // We think of this loop as mapping string keys to their values.
      let stringKeyMapped = false;
      for ( const stringFile of stringFiles ) {

        // Find the key in the file that matches the string key we're interested in.
        const matchingKey = Object.keys( stringFile ).find( key => key === stringKey );
        if ( matchingKey && stringFile[ matchingKey ] ) {
          commonEnglishStringKeysAndValues[ stringKey ] = stringFile[ matchingKey ].value;
          stringKeyMapped = true;
        }
      }

      // It's possible that the string key won't get mapped to a value. This can happen if a key-value pair is no longer
      // used.
      if ( !stringKeyMapped ) {

        // We don't display unused string keys and strings to the user. They get stripped out prior to sending them to
        // the client.
        commonEnglishStringKeysAndValues[ stringKey ] = NO_LONGER_USED_FLAG;
      }
    }
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( `got ${simName}'s common English string keys and values; returning them` );

  return commonEnglishStringKeysAndValues;
};

export default getCommonEnglishStringKeysAndValues;