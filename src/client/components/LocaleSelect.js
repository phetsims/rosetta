// Copyright 2021, University of Colorado Boulder

/**
 * We define the locale select. We sort the locales by name. The name is usually the English name of the language.
 *
 * @author Liam Mulhall
 */

import axios from 'axios';
import React, { useEffect, useState } from 'react';

/**
 * This component is a select (commonly referred to as a dropdown) for locales. The locales in this select look like
 *
 * English (en)
 * German (de)
 * Spanish (es)
 *
 * and so on. We have the English name of the language followed by the locale code in parentheses.
 *
 * @param {Object} field - props used by Formik
 * @returns {JSX.Element}
 * @constructor
 */
const LocaleSelect = ( { field } ) => { // eslint-disable-line react/prop-types

  // for storing locale info and
  const [ localeInfo, setLocaleInfo ] = useState( {} );

  // get locale info
  useEffect( async () => {
    try {
      const localeInfoRes = await axios.get( '/translate/api/localeInfo' );
      setLocaleInfo( localeInfoRes.data );
    }
    catch( e ) {
      console.error( e );
    }
  }, [] );

  // sort the locales by name
  // in other words, sort the languages alphabetically
  const localeNamesAndCodes = [];
  for ( const localeCode in localeInfo ) {
    localeNamesAndCodes.push( [ localeInfo[ localeCode ].name, localeCode ] );
  }
  localeNamesAndCodes.sort();

  // create a list of locale options to iterate over
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

  // use the spread operator to give the select each of the props in the field object
  return (
    <select {...field}>

      {/* iterate over locale options */}
      {localeOptions}
    </select>
  );
};

export default LocaleSelect;