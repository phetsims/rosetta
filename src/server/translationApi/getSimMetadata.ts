// Copyright 2021-2025, University of Colorado Boulder

/**
 * Get the PhET metadata for all sims. The metadata comes from the PhET website.  It is cached by this function for a
 * configurable amount of time to avoid hitting the main PhET server too often, because the metadata is big and takes
 * a while to retrieve. The metadata is used to determine the latest version each sim, the locales into which sims are
 * translated, dependencies for sims, and so forth.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { UNPUBLISHED_SIMS_TO_INCLUDE } from '../../common/constants.js';
import privateConfig from '../../common/privateConfig.js';
import publicConfig from '../../common/publicConfig.js';
import logger from './logger.js';
import { SimMetadata } from './SimMetadataTypes.js';

const { randomBytes } = await import( 'node:crypto' );
const PSEUDO_RANDOM_STRING_LENGTH = 40;
const METADATA_URL = privateConfig.SERVER_URL +
                     '/services/metadata/1.3/simulations?format=json&type=html&include-unpublished=true&summary';
const METADATA_REQ_OPTIONS = {
  headers: {
    Authorization: `Basic ${Buffer.from( `token:${privateConfig.SERVER_TOKEN}` ).toString( 'base64' )}`
  }
};

// The most recently retrieved sim metadata.
let latestSimMetadata: SimMetadata | null = null;

// The time at which the metadata was last updated.  This is used to determine if the metadata is stale.
let timeOfLastUpdate = Number.NEGATIVE_INFINITY;

// A promise that is in progress to fetch the metadata.  This is used to avoid multiple simultaneous requests for
// metadata.
let fetchInProgress: Promise<SimMetadata> | null = null;

/**
 * Make a pseudo random string of characters and numbers. Used for making the nonce query parameter that we use to bust
 * the server's sim metadata cache.
 *
 * @param length - Length of the string
 * @returns A pseudo-random string
 */
const makePseudoRandomString = ( length: number ): string => {
  return randomBytes( length ).toString( 'hex' );
};

/**
 * Function to fetch the metadata from the server. This is called when the metadata is stale or nonexistent.
 */
async function fetchMetadata(): Promise<SimMetadata> {

  const cacheBustingQueryParam = '&nonce=' +
                                 makePseudoRandomString( PSEUDO_RANDOM_STRING_LENGTH );
  const cacheBustingSimMetadataUrl = METADATA_URL + cacheBustingQueryParam;
  logger.info( `cache-busting sim metadata url: ${cacheBustingSimMetadataUrl}` );

  const response = await fetch( cacheBustingSimMetadataUrl, METADATA_REQ_OPTIONS );

  if ( !response.ok ) {
    throw new Error( `Failed to fetch metadata: ${response.statusText}` );
  }

  latestSimMetadata = await response.json() as SimMetadata;
  timeOfLastUpdate = Date.now();

  // If there are unpublished sims to include, add them to the metadata here.  This creates a faked-out metadata entry
  // for each of the specified sims with just the information needed by Rosetta to allow translation.
  if ( latestSimMetadata && latestSimMetadata.projects && UNPUBLISHED_SIMS_TO_INCLUDE.length > 0 ) {
    UNPUBLISHED_SIMS_TO_INCLUDE.forEach( simInfo => {

      // First make sure that this sim is NOT in the metadata already.  If it is, we log an error and skip it.
      if ( latestSimMetadata?.projects.some( project => project.name === `html/${simInfo.name}` ) ) {
        logger.error( `Sim ${simInfo.name} is on unpublished sim list but was found in the metadata, skipping.` );
        return;
      }

      // Add the faked-out metadata for the unpublished sim.  Much of the information here is made up and isn't used by
      // Rosetta, but needs to be present to satisfy type checking and the metadata schema.
      latestSimMetadata?.projects.push( {
        visible: true,
        name: `html/${simInfo.name}`,
        id: 999,
        type: 2,

        // Use arbitrary values for the version fields, since they are not used by Rosetta.
        version: {
          string: '0.0.1',
          major: 0,
          minor: 0,
          dev: 1,
          timestamp: 0
        },

        simulations: [
          {
            visible: true,
            name: simInfo.name,
            altImageCount: 0,
            highGradeLevel: 0,
            designTeam: '',
            lreTerms: [],
            subjects: [],
            allLocalesSimURL: '',
            libraries: '',
            isNew: 0,
            relatedSimulations: [],
            keywordIds: [],
            lowGradeLevel: 0,
            alignmentIds: [],
            scienceLiteracyMapKeys: [],
            cheerpjVersion: '',
            licenseUrls: [],
            secondaryAlignmentIds: [],
            a11yFeatures: [],
            thanksTo: '',
            createTime: 0,
            credits: {
              thanksTo: '',
              designTeam: '',
              libraries: ''
            },
            topicIds: [],
            id: 0,
            // @ts-expect-error - this faked-out metadata doesn't contain a fully populated localizedSimulations object
            localizedSimulations: {
              en: {
                id: 5982,
                title: simInfo.title,
                isCheerpj: false,
                teachersGuide: '',
                videoUrl: '',
                sonificationVideoUrl: '',
                descriptionVideoUrl: '',
                runUrl: '',
                description: '',
                simPageUrl: '',
                learningGoals: '',
                downloadUrl: ''
              }
            },
            legacyType: 'none'
          }
        ]
      } );
    } );

    // Sort the projects by sim name to ensure consistent order, since that's how the metadata is supposed to be.
    latestSimMetadata.projects.sort( ( a, b ) => {
      const nameA = a.name;
      const nameB = b.name;
      return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
    } );
  }

  return latestSimMetadata;
}

/**
 * Return the sim metadata object. Update it if it is stale, otherwise use cached sim metadata.
 *
 * @returns A promise resolving to the sim metadata
 * @throws Error if the metadata cannot be retrieved
 */
const getSimMetadata = async (): Promise<SimMetadata> => {
  logger.info( 'getting sim metadata' );

  let data: SimMetadata;
  try {
    const isStale = !latestSimMetadata || ( Date.now() - timeOfLastUpdate > publicConfig.VALID_METADATA_DURATION );
    logger.info( `sim metadata requested, isStale = ${isStale}` );

    if ( isStale ) {
      if ( !fetchInProgress ) {
        logger.info( 'initiating new fetch for sim metadata' );
        fetchInProgress = fetchMetadata().finally( () => {
          fetchInProgress = null;
        } );
      }
      else {
        logger.info( 'fetch already in progress, waiting for it to finish' );
      }
      data = await fetchInProgress;
      logger.info( 'sim metadata fetch succeeded' );
    }
    else {
      logger.info( 'using cached sim metadata' );
      data = latestSimMetadata!;
    }
  }
  catch( error ) {
    logger.error( `getSimMetadata failed, error = ${error}` );
    throw error;
  }

  return data;
};

export default getSimMetadata;