// Copyright 2023, University of Colorado Boulder

/**
 * Create a custom react hook for getting a boolean that
 * tells us whether we should show translation report stats.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import { useEffect, useState } from 'react';
import { TRANSLATION_API_ROUTE } from '../../common/constants';
import alertErrorMessage from '../js/alertErrorMessage';

/**
 * Get the show stats boolean from the backend and return it.
 * If the request fails, show an error message. For more info on
 * why we need this boolean, see
 * https://github.com/phetsims/rosetta/issues/410#issuecomment-1563781403.
 *
 * @returns {Object} - locale info with locale codes and locale names
 */
const useShowStats = () => {
  const [ showStats, setShowStats ] = useState( false );
  useEffect( async () => {
    try {
      const showStatsRes = await axios.get( `${TRANSLATION_API_ROUTE}/showStats` );
      setShowStats( showStatsRes.data );
    }
    catch( e ) {
      alertErrorMessage( e );
    }
  }, [] );
  return showStats;
};

export default useShowStats;