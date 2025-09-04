// Copyright 2022, University of Colorado Boulder

/**
 * We define the locale select. We sort the locales by name. The name is usually the English name of the language.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import React, { useContext } from 'react';
import LoadingSpinner from './LoadingSpinner.jsx';
import { LocaleInfoContext } from './RosettaRoutes.jsx';

type LocaleInfo = Record<string, {
  name: string;
}>;

type FieldProps = Record<string, string>;

type LocaleSelectProps = {
  field: FieldProps;
};

/**
 * This component is a select (commonly referred to as a dropdown) for locales. The locales in this select look like
 *
 * English (en)
 * German (de)
 * Spanish (es)
 *
 * and so on. We have the English name of the language followed by the locale code in parentheses.
 */
const LocaleSelect: React.FC<LocaleSelectProps> = ( { field } ) => {
  const localeInfo = useContext( LocaleInfoContext ) as LocaleInfo;

  // Put the locale names and codes into an array as a set of tuples.
  const localeNamesAndCodes: [ string, string ][] = [];
  for ( const localeCode in localeInfo ) {
    localeNamesAndCodes.push( [ localeInfo[ localeCode ].name, localeCode ] );
  }

  // Sort the locales by name in alphabetical order (case-insensitive).
  localeNamesAndCodes.sort( ( a, b ) => {
    const lowerA = a[ 0 ].toLowerCase();
    const lowerB = b[ 0 ].toLowerCase();
    if ( lowerA < lowerB ) {
      return -1;
    }
    if ( lowerA > lowerB ) {
      return 1;
    }
    return 0;
  } );

  // Put the locale names and codes into an array of JSX option elements.
  const defaultOptionJsx = (
    <option key='' value=''>
      — Select Locale —
    </option>
  );
  const localeOptions = [ defaultOptionJsx ];
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

  let jsx;
  if ( localeOptions.length === 0 ) {
    jsx = <LoadingSpinner/>;
  }
  else {

    // Use the spread operator to give the select each of the props in the field object.
    jsx = (
      <select {...field}>
        {/* Iterate over locale options. */}
        {localeOptions}
      </select>
    );
  }
  return jsx;
};

export default LocaleSelect;