// Copyright 2021, University of Colorado Boulder

/* eslint-disable no-undef */
/* eslint-disable prefer-const */

/**
 * We define the form for translations. Once the user has selected the locale and sim they want, they see this
 * component.
 *
 * @author Liam Mulhall
 */

import axios from 'axios';
import { Form, Formik } from 'formik';
import React, { createContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as Yup from 'yup';
import saveTranslation from '../utils/saveTranslation.js';
import submitTranslation from '../utils/submitTranslation.js';
import testTranslation from '../utils/testTranslation.js';
import LoadingSpinner from './LoadingSpinner.jsx';
import TranslationFormButtons from './TranslationFormButtons.jsx';
import TranslationFormHeader from './TranslationFormHeader.jsx';
import TranslationTables from './TranslationTables.jsx';

const ErrorContext = createContext( null );

/**
 * This component is a form with a table that is populated by the translation form data that we get from the backend.
 *
 * @returns {JSX.Element}
 * @constructor
 */
const TranslationForm = () => {

  // grab the query parameters for later use
  const params = useParams();

  // for storing and setting translation form data
  const [ translationFormData, setTranslationFormData ] = useState( null );

  // get the translation form data for the selected locale and sim
  useEffect( () => {
    try {
      ( async () => {
        const translationFormDataRes = await axios.get( `/translationApi/translationFormData/${params.simName}/${params.locale}` );
        setTranslationFormData( translationFormDataRes.data );
      } )();
    }
    catch( e ) {
      console.error( e );
    }
  }, [] );

  const [ buttonId, setButtonId ] = useState( '' );
  const handleButtonClick = evt => {
    setButtonId( evt.target.id );
  };

  let translationFormJsx;
  if ( translationFormData === null ) {
    translationFormJsx = (
      <div>
        <TranslationFormHeader locale={params.locale} simName={params.simName}/>
        <LoadingSpinner/>
      </div>
    );
  }
  else {

    const simSpecificKeys = Object.keys( translationFormData.simSpecific ).map(
      key => key.split( '_DOT_' ).join( '.' )
    );
    const simSpecificValidationObject = {};
    for ( const key of simSpecificKeys ) {
      simSpecificValidationObject[ key ] = Yup.object( {
        translated: Yup.string().required()
      } );
    }
    const commonKeys = Object.keys( translationFormData.common ).map(
      key => key.split( '_DOT_' ).join( '.' )
    );
    const commonValidationObject = {};
    for ( const key of commonKeys ) {
      commonValidationObject[ key ] = Yup.object( {
        translated: Yup.string().required()
      } );
    }
    const validationObject = {
      simSpecific: Yup.object( simSpecificValidationObject ),
      common: Yup.object( commonValidationObject )
    };

    const validationSchema = Yup.object().shape( validationObject );
    translationFormJsx = (
      <div>
        <TranslationFormHeader locale={params.locale} simName={params.simName}/>
        <Formik
          initialValues={translationFormData}
          validationSchema={validationSchema}
          onSubmit={async values => {
            if ( buttonId === '' ) {
              console.error( 'unable to get button id' );
            }
            else if ( buttonId === 'save' ) {
              await saveTranslation( values, params.simName, params.locale );
            }
            else if ( buttonId === 'submit' ) {
              await submitTranslation( values, params.simName, params.locale );
            }
            else if ( buttonId === 'test' ) {
              await testTranslation( values, params.simName, params.locale );
            }
          }}
        >
          {props => {
            console.log( props );
            return (
              <Form>
                <TranslationFormButtons
                  simName={params.simName}
                  locale={params.locale}
                  handleButtonClick={handleButtonClick}
                  {...props}
                />
                <ErrorContext.Provider value={props.errors}>
                  <TranslationTables
                    translationFormData={translationFormData}
                    {...props}
                  />
                </ErrorContext.Provider>
                <TranslationFormButtons
                  simName={params.simName}
                  locale={params.locale}
                  handleButtonClick={handleButtonClick}
                  {...props}
                />
              </Form>
            );
          }}
        </Formik>
      </div>
    );
  }
  return translationFormJsx;
};

export default TranslationForm;
export { ErrorContext };