// Copyright 2022, University of Colorado Boulder

/**
 * We define the translation report for a given locale.
 *
 * @author Liam Mulhall
 */

import { useParams } from 'react-router-dom';
import useTranslationReportObjects from '../hooks/useTranslationReportObjects.jsx';
import getTranslationReportRows from '../utils/getTranslationReportRows.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';
import SortButton from './SortButton.jsx';

/**
 * This component allows a user to see a translation report for a given locale (statistics about translations) and
 * allows them to navigate to any of the simulations to translate them.
 *
 * @returns {JSX.Element}
 * @constructor
 */
const TranslationReport = () => {
  const params = useParams();
  const { reportPopulated, reportObjects } = useTranslationReportObjects( params.locale );
  const reportRows = getTranslationReportRows( reportObjects, params.locale );
  return (
    <div>
      <h1>Translation Report</h1>
      <h2 className='text-muted'>Locale: {params.locale}</h2>
      {reportPopulated
       ? <p>The translation report is finished!</p>
       : <><p>The translation report is being populated...</p><LoadingSpinner/></>}
      <table className='table table-striped'>
        <thead>
          <tr>
            <th>Sim Title <SortButton reportPopulated={reportPopulated}/></th>
            <th>Sim-Specific Strings <SortButton reportPopulated={reportPopulated}/></th>
            <th>Common Strings <SortButton reportPopulated={reportPopulated}/></th>
          </tr>
        </thead>
        <tbody>{reportRows}</tbody>
      </table>
    </div>
  );
};

export default TranslationReport;