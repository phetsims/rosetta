// Copyright 2021, University of Colorado Boulder

import axios from 'axios';
import React, { useEffect, useState } from 'react';

const LocaleSelect = ( { field } ) => { // eslint-disable-line react/prop-types

  const [ localeInfo, setLocaleInfo ] = useState( {} );

  useEffect( async () => {
    try {
      const localeInfoRes = await axios.get( '/translate/api/localeInfo' );
      setLocaleInfo( localeInfoRes.data );
    }
    catch( e ) {
      console.error( e );
    }
  }, [] );

  const localeNamesAndCodes = [];
  for ( const localeCode in localeInfo ) {
    localeNamesAndCodes.push( [ localeInfo[ localeCode ].name, localeCode ] );
  }
  localeNamesAndCodes.sort();

  const localeOptions = [];
  for ( const locale of localeNamesAndCodes ) {
    localeOptions.push(
      <option
        key={locale[ 1 ]}
        value={locale[ 1 ]}
      >
        {`${locale[ 0 ]} (${locale[ 1 ]})`}
      </option>
    );
  }

  return (
    <select {...field} defaultValue=''>
      {localeOptions}
    </select>
  );
};

export default LocaleSelect;