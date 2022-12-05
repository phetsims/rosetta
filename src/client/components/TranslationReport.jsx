// Copyright 2022, University of Colorado Boulder

/**
 * We define the translation report for a given locale.
 *
 * @author Liam Mulhall
 */

import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { LocaleInfoContext } from './RosettaRoutes.jsx';
import TranslatedSimsTable from './TranslatedSimsTable.jsx';

/**
 * This component allows a user to see a translation report for a given locale (statistics about translations) and
 * allows them to navigate to any of the simulations to translate them.
 *
 * @returns {JSX.Element}
 * @constructor
 */
const TranslationReport = () => {

  // Get URL params. (Need locale from params.)
  const params = useParams();

  // Tell user what locale they are seeing the report for.
  const localeInfo = useContext( LocaleInfoContext );
  let localeName = 'Loading...';
  if ( Object.keys( localeInfo ).length > 0 ) {
    localeName = localeInfo[ params.locale ].name;
  }

  return (
    <div>
      <h1>Translation Report</h1>
      <h2 className='text-muted'>Locale: {localeName} ({params.locale})</h2>
      <TranslatedSimsTable locale={params.locale} localeName={localeName}/>
    </div>
  );
};

export default TranslationReport;