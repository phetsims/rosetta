// Copyright 2023, University of Colorado Boulder

import logger from './logger.js';

/**
 * Make a new history array for a translated string file.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

const makeNewHistoryArray = ( stringKey, oldTranslationFile, newHistoryEntry ) => {

  // Add the history entry to the history array. If the old translation file
  // was a manually ported legacy (Java/Flash) sim translation, there might
  // not be a history array. This is a rare-but-valid case that we need to
  // handle. See https://github.com/phetsims/rosetta/issues/329#issuecomment-1371588737
  // and https://github.com/phetsims/rosetta/issues/375#issuecomment-1444581287
  // for more info.
  const oldHistoryArray = oldTranslationFile[ stringKey ].history;
  let newHistoryArray;
  if ( oldHistoryArray ) {
    logger.verbose( 'old history array present; adding to it' );
    newHistoryArray = oldHistoryArray.concat( [ newHistoryEntry ] );
  }
  else {
    logger.verbose( 'old history array undefined; creating new one' );
    newHistoryArray = [ newHistoryEntry ];
  }

  return newHistoryArray;
};

export default makeNewHistoryArray;