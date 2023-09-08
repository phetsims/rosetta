// Copyright 2022, University of Colorado Boulder

/**
 * Provide functionality for the `submitTranslation` API route.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 * @author John Blanco (PhET Interactive Simulations)
 */

import privateConfig from '../../../common/privateConfig.js';
import deleteSavedTranslation from '../deleteSavedTranslation.js';
import getReposToStoreLongTerm from '../getReposToStoreLongTerm.js';
import getSimMetadata from '../getSimMetadata.js';
import getSimNamesAndTitles from '../getSimNamesAndTitles.js';
import logger from '../logger.js';
import prepareTranslationForLongTermStorage from '../prepareTranslationForLongTermStorage.js';
import requestBuilds from '../requestBuilds.js';
import storeEachRepoContents from '../storeEachRepoContents.js';
import { reportObjectCache } from '../translationApi.js';

/**
 * Submit a translation, which means to store the new or updated translation strings in long-term storage and then
 * request that the translated sim be built and published to the website.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} - an object indicating the success or failure of the steps involved
 */
const submitTranslation = async ( req, res ) => {
  logger.info( 'submitTranslation called' );
  const submissionStatus = {
    allRepoContentsStored: false,
    buildRequestsSucceeded: false
  };
  try {

    // The format of the translation data received from the client is not quite what is needed for long-term storage, so
    // it is 'prepared' for storage here.
    const preparedTranslation = await prepareTranslationForLongTermStorage( req.body );

    // Save the new or updated strings to the long-term storage area.  This may include strings for common code and/or
    // the specific sim that the user was working on.
    logger.info( `saving strings for sim ${req.body.simName} and locale ${req.body.locale} in long-term storage` );
    const repos = await getReposToStoreLongTerm( preparedTranslation );
    submissionStatus.allRepoContentsStored = await storeEachRepoContents( preparedTranslation, repos );

    if ( submissionStatus.allRepoContentsStored ) {
      logger.info( 'successfully stored translation long term' );
    }

    if ( submissionStatus.allRepoContentsStored || !privateConfig.PERFORM_STRING_COMMITS ) {

      // For each sim repo in the translation, we need to set the sim repo's report object to dirty. See
      // https://github.com/phetsims/rosetta/issues/379 for more info and background on this.
      const simNamesAndTitles = getSimNamesAndTitles( await getSimMetadata(), 'true' );
      const simNames = Object.keys( simNamesAndTitles );
      for ( const repo of repos ) {
        if ( simNames.includes( repo ) ) {

          // The sim being translated should be included here unless the translator only translated shared strings
          // and/or common strings.
          reportObjectCache.setDirtyObject( req.body.locale, repo );
        }
      }

      // We redundantly (in some cases) and unnecessarily (in other cases) set the sim's report object to dirty because
      // it might confuse the translator if they don't see the "pending update" note next to a sim they just translated,
      // even though they only translated shared or common strings.
      reportObjectCache.setDirtyObject( req.body.locale, req.body.simName );
      const wasDeleted = deleteSavedTranslation( {
        userId: req.body.userId,
        simName: req.body.simName,
        locale: req.body.locale
      } );
      if ( wasDeleted ) {
        logger.info( 'previously saved translation deleted from short-term storage' );
      }
      else {
        logger.info( 'either deletion of previously saved translation from short-term storage failed or there was no previously saved translation' );
      }

      // Since the storage was successful, we now request builds of the sim and locale.  This will publish or update the
      // translated versions of the sim.
      submissionStatus.buildRequestsSucceeded = await requestBuilds(
        req.body.simName,
        req.body.locale,
        req.body.userId
      );
      if ( submissionStatus.buildRequestsSucceeded ) {
        logger.info( 'build requests succeeded' );
      }
    }
    else {
      logger.error( `long-term storage of ${req.body.locale}/${req.body.simName} failed` );
    }
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( 'done attempting to submit translation' );
  res.send( submissionStatus );
};

export default submitTranslation;