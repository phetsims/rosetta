// Copyright 2022, University of Colorado Boulder

/**
 * Create a custom hook for getting translation report objects (sent via server sent events) from the backend.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { useEffect, useState } from 'react';
import clientConstants from '../utils/clientConstants.js';

/**
 * Return the report objects we get from the backend's server sent events. Also return a boolean telling whether the
 * translation report is populated, i.e. the server is done sending events. Also return a setter function for report
 * objects.
 *
 * @param locale - ISO 639-1 locale code, e.g. zh_TW for Chinese with traditional characters
 * @param numberOfEvents - number of server sent events we want, i.e. number of report objects we want
 * @returns {Object} - object containing report objects, a boolean telling whether the report is populated, and a method
 *                     for sorting report objects
 */
const useTranslationReportObjects = ( locale, numberOfEvents = null ) => {

  const [ listening, setListening ] = useState( false );
  const [ reportPopulated, setReportPopulated ] = useState( false );
  const [ reportObjects, setReportObjects ] = useState( [] );

  useEffect( () => {
    if ( !listening && !reportPopulated ) {
      let translationReportUrl = `${clientConstants.translationApiRoute}/translationReportEvents/${locale}`;
      if ( numberOfEvents ) {
        translationReportUrl = `${clientConstants.translationApiRoute}/translationReportEvents/${locale}/${numberOfEvents}`;
      }
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
  }, [ listening, reportPopulated, reportObjects ] );

  return {
    reportPopulated: reportPopulated,
    reportObjects: reportObjects,
    setReportObjects: setReportObjects
  };
};

export default useTranslationReportObjects;