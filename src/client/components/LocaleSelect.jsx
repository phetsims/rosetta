// Copyright 2022, University of Colorado Boulder

/**
 * We define the locale select. We sort the locales by name. The name is usually the English name of the language.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { useContext } from 'react';
import { LocaleInfoContext } from './RosettaRoutes.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

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
 */
const LocaleSelect = ( { field } ) => {

  const localeInfo = useContext( LocaleInfoContext );

  // Sort the locales by name.
  // In other words, sort the languages alphabetically.
  const localeNamesAndCodes = [];
  for ( const localeCode in localeInfo ) {
    localeNamesAndCodes.push( [ localeInfo[ localeCode ].name, localeCode ] );
  }
  localeNamesAndCodes.sort();

  // Create a list of locale options to iterate over.
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