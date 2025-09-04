// Copyright 2023, University of Colorado Boulder

/**
 * Create a custom react hook for getting a boolean that
 * tells us whether we should show translation report stats.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { useEffect, useState } from 'react';
import { TRANSLATION_API_ROUTE } from '../../common/constants.js';
import alertErrorMessage from '../js/alertErrorMessage.js';

/**
 * Get the show stats boolean from the backend and return it.
 * If the request fails, show an error message. For more info on
 * why we need this boolean, see
 * https://github.com/phetsims/rosetta/issues/410#issuecomment-1563781403.
 */
const useShowStats = (): boolean => {
  const [ showStats, setShowStats ] = useState<boolean>( false );

  useEffect( () => {
    const fetchShowStats = async (): Promise<void> => {
      try {
        const response = await fetch( `${TRANSLATION_API_ROUTE}/showStats` );
        if ( !response.ok ) {
          throw new Error( `HTTP error! Status: ${response.status}` );
        }
        const data = await response.json();
        setShowStats( data );
      }
      catch( e ) {
        void alertErrorMessage( e as string );
      }
    };

    void fetchShowStats();
  }, [] );

  return showStats;
};

export default useShowStats;