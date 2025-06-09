// Copyright 2022, University of Colorado Boulder

/**
 * Create a custom react hook for getting locale info from the backend.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { useEffect, useState } from 'react';
import { TRANSLATION_API_ROUTE } from '../../common/constants';
import { LocaleInfo } from '../ClientDataTypes';
import alertErrorMessage from '../js/alertErrorMessage';

/**
 * Get the locale info from the backend and return it. If the request fails, show an error message.
 */
const useLocaleInfo = (): LocaleInfo => {
  const [ localeInfo, setLocaleInfo ] = useState<LocaleInfo>( {} as LocaleInfo );

  useEffect( () => {
    const fetchLocaleInfo = async (): Promise<void> => {
      try {
        const response = await fetch( `${TRANSLATION_API_ROUTE}/localeInfo` );
        if ( !response.ok ) {
          throw new Error( `HTTP error! Status: ${response.status}` );
        }
        const data = await response.json();
        setLocaleInfo( data );
      }
      catch( e ) {
        void alertErrorMessage( e as string );
      }
    };

    void fetchLocaleInfo();
  }, [] );

  return localeInfo;
};

export default useLocaleInfo;