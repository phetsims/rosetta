// Copyright 2022, University of Colorado Boulder

/**
 * Create a custom hook for getting translation report objects (sent via server sent events) from the backend.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { useContext, useEffect, useState } from 'react';
import { TRANSLATION_API_ROUTE } from '../../common/constants';
import { ReportObject, WebsiteUserData } from '../clientTypes';
import { WebsiteUserDataContext } from '../components/Rosetta';

type TranslationReportHookResult = {
  reportPopulated: boolean;
  reportObjects: ReportObject[];
  setReportObjects: React.Dispatch<React.SetStateAction<ReportObject[]>>;
};

/**
 * Return the report objects we get from the backend's server sent events. Also return a boolean telling whether the
 * translation report is populated, i.e. the server is done sending events. Also return a setter function for report
 * objects.
 */
const useTranslationReportObjects = (
  locale: string,
  wantsUntranslated: boolean,
  showStats: boolean
): TranslationReportHookResult => {

  const [ listening, setListening ] = useState<boolean>( false );
  const [ reportPopulated, setReportPopulated ] = useState<boolean>( false );
  const [ reportObjects, setReportObjects ] = useState<ReportObject[]>( [] );

  const websiteUserData = useContext<WebsiteUserData>( WebsiteUserDataContext );

  useEffect( () => {
    if ( !listening && !reportPopulated && showStats ) {
      const translationReportUrl = `${TRANSLATION_API_ROUTE}/translationReportEvents/${locale}?wantsUntranslated=${wantsUntranslated}&isTeamMember=${websiteUserData.teamMember}`;
      const translationReportSource = new EventSource( translationReportUrl );
      translationReportSource.onmessage = event => {
        if ( event.data !== 'closed' ) {
          const parsedData = JSON.parse( event.data ) as ReportObject;
          setReportObjects( reportObjects => reportObjects.concat( parsedData ) );
        }
        else {
          setReportPopulated( true );
          translationReportSource.close();
        }
      };
      setListening( true );
    }
  }, [ listening, reportPopulated, locale, wantsUntranslated, websiteUserData.teamMember, showStats ] );

  // If showStats is false, this is a dummy object.
  return {
    reportPopulated: reportPopulated,
    reportObjects: reportObjects,
    setReportObjects: setReportObjects
  };
};

export default useTranslationReportObjects;