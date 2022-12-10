// Copyright 2022, University of Colorado Boulder

/**
 * Create a component that displays information about the translation form.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { useContext } from 'react';
import { SimNamesAndTitlesContext } from './RosettaRoutes.jsx';

/**
 * Return a component that displays locale info and a sim title for a locale/sim in the translation form.
 * This info appears above the translation form.
 *
 * @param props
 * @returns {JSX.Element}
 */
const TranslationFormHeader = props => {

  const simNamesAndTitles = useContext( SimNamesAndTitlesContext );
  let simTitle = 'Loading...';
  if ( Object.keys( simNamesAndTitles ).length > 0 ) {
    simTitle = simNamesAndTitles[ props.simName ];
  }

  return <h2 className='text-muted'>Translating {props.localeName} ({props.locale}) {simTitle}</h2>;
};

export default TranslationFormHeader;