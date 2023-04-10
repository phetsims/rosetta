// Copyright 2022, University of Colorado Boulder

/**
 * Provide functionality for submit translation API route.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import deleteSavedTranslation from '../deleteSavedTranslation.js';
import getReposToStoreLongTerm from '../getReposToStoreLongTerm.js';
import getSimMetadata from '../getSimMetadata.js';
import logger from '../logger.js';
import prepareTranslationForLongTermStorage from '../prepareTranslationForLongTermStorage.js';
import requestBuild from '../requestBuild.js';
import storeEachRepoContents from '../storeEachRepoContents.js';
import { reportObjectCache } from '../translationApi.js';
import getSimNamesAndTitles from '../getSimNamesAndTitles.js';

/**
 * API function. Prepare a user's translation for long-term storage and store the user's translation in long-term
 * storage.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<String>} - success message
 */
const submitTranslation = async ( req, res ) => {
  logger.info( 'attempting to submit translation' );
  const submitStatus = {
    allRepoContentsStored: false,
    buildRequested: false
  };
  try {
    logger.info( `sending ${req.body.locale}/${req.body.simName} translation to be prepared for long-term storage` );
    const preparedTranslation = await prepareTranslationForLongTermStorage( req.body );
    logger.info( `sending ${req.body.locale}/${req.body.simName} translation to be stored long-term` );
    const repos = await getReposToStoreLongTerm( preparedTranslation );
    submitStatus.allRepoContentsStored = await storeEachRepoContents( preparedTranslation, repos );
    if ( submitStatus.allRepoContentsStored ) {
      logger.info( 'successfully stored translation long term' );

      // For each sim repo in the translation, we need to set the sim repo's
      // report object to dirty. See https://github.com/phetsims/rosetta/issues/379
      // for more info and background on this.
      const simNamesAndTitles = getSimNamesAndTitles( await getSimMetadata(), 'true' );
      const simNames = Object.keys( simNamesAndTitles );
      for ( const repo of repos ) {
        if ( simNames.includes( repo ) ) {

          // The sim being translated should be included here unless the translator
          // only translated shared strings and/or common strings.
          reportObjectCache.setDirtyObject( req.body.locale, repo );
        }
      }

      // We redundantly (in some cases) and unnecessarily (in other cases) set
      // the sim's report object to dirty because it might confuse the translator
      // if they don't see the "pending update" note next to a sim they just
      // translated, even though they only translated shared or common strings.
      reportObjectCache.setDirtyObject( req.body.locale, req.body.simName );
      const wasDeleted = deleteSavedTranslation( {
        userId: req.body.userId,
        simName: req.body.simName,
        locale: req.body.locale
      } );
      if ( wasDeleted ) {
        logger.info( 'previously saved translation deleted' );
      }
      else {
        logger.warn( 'either deletion of previously saved translation failed or there was no previously saved translation' );
      }
      submitStatus.buildRequested = await requestBuild( req.body.simName, req.body.locale, req.body.userId );
      if ( submitStatus.buildRequested ) {
        logger.info( 'build request succeeded' );
      }
    }
    else {
      logger.error( `long-term storage of ${req.body.locale}/${req.body.simName} failed` );
    }
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( `build requested: ${submitStatus.buildRequested}` );
  logger.info( 'done attempting to submit translation' );
  res.send( submitStatus );
};

export default submitTranslation;