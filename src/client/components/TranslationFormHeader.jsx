// Copyright 2022, University of Colorado Boulder

/**
 * Create a component that displays information about the translation form.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { useContext } from 'react';
import { LocaleInfoContext, SimNamesAndTitlesContext } from './RosettaRoutes.jsx';

/**
 * Return a component that displays locale info and a sim title for a locale/sim in the translation form.
 * This info appears above the translation form.
 *
 * @param props
 * @returns {JSX.Element}
 */
const TranslationFormHeader = props => {

  const localeInfo = useContext( LocaleInfoContext );
  let localeName = 'Loading...';
  if ( Object.keys( localeInfo ).length > 0 ) {
    localeName = localeInfo[ props.locale ].name;
  }

  const simNamesAndTitles = useContext( SimNamesAndTitlesContext );
  let simTitle = 'Loading...';
  if ( Object.keys( simNamesAndTitles ).length > 0 ) {
    simTitle = simNamesAndTitles[ props.simName ];
  }

  return (
    <div>
      <h1>Translation Form</h1>
      <h2 className='text-muted'>Locale: {localeName} ({props.locale})</h2>
      <h2 className='text-muted'>Sim: {simTitle}</h2>
    </div>
  );
};

export default TranslationFormHeader;