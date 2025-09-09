// Copyright 2022, University of Colorado Boulder

/**
 * Create a custom react hook for getting locale info from the backend.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { useEffect, useState } from 'react';
import { TRANSLATION_API_ROUTE } from '../../common/constants.js';
import { LocaleInfo } from '../ClientDataTypes.js';
import alertErrorMessage from '../js/alertErrorMessage.js';

/**
 * Get the locale info from the backend and return it. If the request fails, show an error message.
 */
const useLocaleInfo = (): LocaleInfo => {
  const [ localeInfo, setLocaleInfo ] = useState<LocaleInfo>( {} as LocaleInfo );

  useEffect( () => {
    ( async (): Promise<void> => {
      try {
        const response = await fetch( `${TRANSLATION_API_ROUTE}/localeInfo` );
        if ( !response.ok ) {
          throw new Error( `HTTP error! Status: ${response.status}` );
        }
        const data = await response.json();
        setLocaleInfo( data );
      }
      catch( e ) {
        await alertErrorMessage( e as string );
      }
    } )();

  }, [] );

  return localeInfo;
};

export default useLocaleInfo;