// Copyright 2022, University of Colorado Boulder

/**
 * Create a custom hook for getting translation report objects from the backend.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { useContext, useEffect, useState } from 'react';
import { TRANSLATION_API_ROUTE } from '../../common/constants';
import { ReportObject } from '../clientTypes.js';
import { WebsiteUserDataContext } from '../components/Rosetta';
import alertErrorMessage from '../js/alertErrorMessage';

type TranslationReportReturn = {
  reportPopulated: boolean;
  reportObjects: ReportObject[];
  setReportObjects: React.Dispatch<React.SetStateAction<ReportObject[]>>;
};

/**
 * Return the report objects we get from the backend. Also return a boolean telling whether the
 * translation report is populated, and a setter function for report objects.
 */
const useTranslationReportObjects = (
  locale: string,
  wantsUntranslated: boolean,
  showStats: boolean
): TranslationReportReturn => {

  const [ reportPopulated, setReportPopulated ] = useState<boolean>( false );
  const [ reportObjects, setReportObjects ] = useState<ReportObject[]>( [] );

  const websiteUserData = useContext( WebsiteUserDataContext );

  useEffect( () => {
    if ( !reportPopulated && showStats ) {
      const fetchTranslationReport = async (): Promise<void> => {
        try {
          const response = await fetch(
            `${TRANSLATION_API_ROUTE}/translationReport/${locale}?wantsUntranslated=${wantsUntranslated}&isTeamMember=${websiteUserData.teamMember}`
          );

          if ( !response.ok ) {
            throw new Error( `HTTP error! Status: ${response.status}` );
          }

          const data = await response.json();
          setReportObjects( data );
          setReportPopulated( true );
        }
        catch( e ) {
          void alertErrorMessage( e as string );
        }
      };

      void fetchTranslationReport();
    }
  }, [ locale, wantsUntranslated, reportPopulated, showStats, websiteUserData ] );

  // If showStats is false, this is a dummy object.
  return {
    reportPopulated: reportPopulated,
    reportObjects: reportObjects,
    setReportObjects: setReportObjects
  };
};

export default useTranslationReportObjects;