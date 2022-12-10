// Copyright 2022, University of Colorado Boulder

/**
 * We define the translation report for a given locale.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { LocaleInfoContext } from './RosettaRoutes.jsx';
import TranslationReportTable from './TranslationReportTable.jsx';

/**
 * This component allows a user to see a translation report for a given locale (statistics about translations) and
 * allows them to navigate to any of the simulations to translate them.
 *
 * @returns {JSX.Element}
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

  // WARNING: For performance reasons, we get a list of translated sims and a list of
  // untranslated sims from the sim metadata as opposed to getting the data from
  // the string files on GitHub. The sim metadata only corresponds to the master branch
  // of phetsims/babel. Thus, if you have the branch for phetsims/babel set to tests in
  // your Rosetta config file, the data in the tables won't be correct.
  return (
    <div>
      <TranslationReportTable locale={params.locale} wantsUntranslated={true} localeName={localeName}/>
      <TranslationReportTable locale={params.locale} wantsUntranslated={false} localeName={localeName}/>
    </div>
  );
};

export default TranslationReport;