/* eslint-disable */

import axios from 'axios';
import getTranslatedStringFileUrl from './getTranslatedStringFileUrl.js';
import logger from './logger.js';

const makeTranslationFileContents = async ( repo, translation ) => {

  const translationFileContents = {};
  const data = {};

  // get old translation file
  const oldTranslationFileUrl = getTranslatedStringFileUrl( repo, translation.locale );
  let oldTranslationFile = null;
  try {
    const oldTranslationFileRes = await axios.get( oldTranslationFileUrl )
    if ( oldTranslationFileRes.status !== 404 ) {
      oldTranslationFile = oldTranslationFileRes.data;
    }
  }
  catch( e ) {
    if ( e.response.status === 404 ) {
      logger.verbose( `no translation file for ${translation.locale}/${repo}` );
    }
    else {
      logger.error( e );
    }
  }

  if ( oldTranslationFile ) {
    console.log( 'wow, it has a file' );
  }
  else {
    console.log( 'darn, no file' );
  }
};

export default makeTranslationFileContents;