// Copyright 2022, University of Colorado Boulder

/**
 * We define the translation report for a given locale.
 *
 * @author Liam Mulhall
 */

import React from 'react';
import { useParams } from 'react-router-dom';

/**
 * This component allows a user to see a translation report for a given locale (statistics about translations, e.g.
 * number of strings translated, total number of strings, etc.) and allows them to navigate to any of the simulations
 * to translate them.
 *
 * @returns {JSX.Element}
 * @constructor
 */
const TranslationReport = () => {

  // grab the query parameters for later use
  const params = useParams();

  return (
    <div>
      <h1>Translation Report</h1>
      <h2 className='text-muted'>Locale: {params.locale}</h2>
    </div>
  );
};

export default TranslationReport;