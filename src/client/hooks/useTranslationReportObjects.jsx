// Copyright 2022, University of Colorado Boulder

import { useEffect, useState } from 'react';
import clientConstants from '../utils/clientConstants.js';

const useTranslationReportObjects = locale => {

  const [ listening, setListening ] = useState( false );
  const [ reportPopulated, setReportPopulated ] = useState( false );
  const [ reportObjects, setReportObjects ] = useState( [] );

  useEffect( () => {
    if ( !listening && !reportPopulated ) {
      const translationReportUrl = `${clientConstants.translationApiRoute}/translationReportEvents/${locale}`;
      const translationReportSource = new EventSource( translationReportUrl );

      // TODO: This doesn't seem to work; fix it.
      // If the user navigates away, close events.
      window.addEventListener( 'unload', () => {
        translationReportSource.close();
      } );
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
  }, [ listening, reportPopulated, reportObjects ] );

  return {
    reportPopulated: reportPopulated,
    reportObjects: reportObjects,
    setReportObjects: setReportObjects
  };
};

export default useTranslationReportObjects;