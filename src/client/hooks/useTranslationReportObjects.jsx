// Copyright 2022, University of Colorado Boulder

/**
 * Create a custom hook for getting translation report objects (sent via server sent events) from the backend.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { useContext, useEffect, useState } from 'react';
import { TRANSLATION_API_ROUTE } from '../../common/constants';
import { WebsiteUserDataContext } from '../components/Rosetta';

/**
 * Return the report objects we get from the backend's server sent events. Also return a boolean telling whether the
 * translation report is populated, i.e. the server is done sending events. Also return a setter function for report
 * objects.
 *
 * @param {string} locale - ISO 639-1 locale code, e.g. zh_TW for Chinese with traditional characters
 * @param {boolean} wantsUntranslated - whether the caller wants translation report objects for untranslated sims
 * @param {boolean} showStats - whether we should show translation stats
 * @returns {object} - object containing report objects, a boolean telling whether the report is populated, and a method
 *                     for sorting report objects
 */
const useTranslationReportObjects = ( locale, wantsUntranslated, showStats ) => {

  const [ listening, setListening ] = useState( false );
  const [ reportPopulated, setReportPopulated ] = useState( false );
  const [ reportObjects, setReportObjects ] = useState( [] );

  const websiteUserData = useContext( WebsiteUserDataContext );

  useEffect( () => {
    if ( !listening && !reportPopulated && showStats ) {
      const translationReportUrl = `${TRANSLATION_API_ROUTE}/translationReportEvents/${locale}?wantsUntranslated=${wantsUntranslated}&isTeamMember=${websiteUserData.teamMember}`;
      const translationReportSource = new EventSource( translationReportUrl );
      translationReportSource.onmessage = event => {
        if ( event.data !== 'closed' ) {
          const parsedData = JSON.parse( event.data );
          setReportObjects( reportObjects => reportObjects.concat( parsedData ) );
        }
        else {
          setReportPopulated( true );
          translationReportSource.close();
        }
      };
      setListening( true );
    }
  }, [ listening, reportPopulated, reportObjects, showStats ] );

  // If showStats is false, this is a dummy object.
  return {
    reportPopulated: reportPopulated,
    reportObjects: reportObjects,
    setReportObjects: setReportObjects
  };
};

export default useTranslationReportObjects;