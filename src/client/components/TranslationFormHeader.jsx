// Copyright 2022, University of Colorado Boulder

/* eslint-disable react/prop-types */

import { useContext } from 'react';
import { LocaleInfoContext, SimNamesAndTitlesContext } from './RosettaRoutes.jsx';

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