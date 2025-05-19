// Copyright 2021, University of Colorado Boulder

/**
 * We define the form for translations. Once the user has selected the locale and sim they want, they see this
 * component.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import { Form, Formik } from 'formik';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { TRANSLATION_API_ROUTE } from '../../common/constants';
import alertErrorMessage from '../js/alertErrorMessage';
import automateTranslation from '../js/automateTranslation';
import makeValidationSchema from '../js/makeValidationSchema';
import saveTranslation from '../js/saveTranslation';
import submitTranslation from '../js/submitTranslation';
import testTranslation from '../js/testTranslation';
import LoadingSpinner from './LoadingSpinner';
import { WebsiteUserDataContext } from './Rosetta';
import { LocaleInfoContext, SimNamesAndTitlesContext } from './RosettaRoutes';
import TranslationFormButtons from './TranslationFormButtons';
import TranslationFormHeader from './TranslationFormHeader';
import TranslationFormTables from './TranslationFormTables';

const ErrorContext = createContext( null );

/**
 * This component is a form with a table that is populated by the translation form data that we get from the backend.
 */
const TranslationForm = () => {

  const params = useParams();
  const websiteUserData = useContext( WebsiteUserDataContext );

  const [ translationFormData, setTranslationFormData ] = useState( null );
  useEffect( () => {
    try {
      ( async () => {
        const translationFormDataRes = await axios.get( `${TRANSLATION_API_ROUTE}/translationFormData/${params.simName}/${params.locale}?userId=${websiteUserData.userId}` );
        setTranslationFormData( translationFormDataRes.data );
      } )();
    }
    catch( e ) {
      alertErrorMessage( e );
    }
  }, [ websiteUserData ] );

  const [ isDisabled, setIsDisabled ] = useState( false );
  const [ buttonId, setButtonId ] = useState( '' );
  const [ testIsLoading, setTestIsLoading ] = useState( false );

  // Track AI-translated fields for metadata and styling
  const [ aiTranslatedFields, setAiTranslatedFields ] = useState( new Set() );

  // Reset AI-translated metadata when form data changes
  useEffect( () => {
    setAiTranslatedFields( new Set() );
  }, [ translationFormData ] );
  const handleButtonClick = evt => {
    setButtonId( evt.target.id );
  };

  const simNamesAndTitles = useContext( SimNamesAndTitlesContext );
  let simTitle = 'Loading...';
  if ( Object.keys( simNamesAndTitles ).length > 0 ) {
    simTitle = simNamesAndTitles[ params.simName ];
  }

  const localeInfo = useContext( LocaleInfoContext );
  let localeName = 'Loading...';
  if ( Object.keys( localeInfo ).length > 0 ) {
    localeName = localeInfo[ params.locale ].name;
  }

  let translationFormJsx;
  if ( translationFormData === null ) {
    translationFormJsx = (
      <div>
        <TranslationFormHeader
          localeName={localeName}
          locale={params.locale}
          simTitle={simTitle}
        />
        <LoadingSpinner/>
      </div>
    );
  }
  else {

    // Make the Formik form validation schema.
    const validationSchema = makeValidationSchema( params.simName, translationFormData );
    translationFormJsx = (
      <div>
        <TranslationFormHeader
          localeName={localeName}
          locale={params.locale}
          simTitle={simTitle}
        />
        <Link to={`/translate/${params.locale}`}>Back to {localeName} ({params.locale}) Sim List</Link>
        <Formik
          initialValues={translationFormData}
          validationSchema={validationSchema}
          onSubmit={async ( values, { setFieldValue } ) => {
            if ( buttonId === '' ) {
              console.error( 'unable to get button id' );
            }
            else if ( buttonId === 'save' ) {
              await saveTranslation( values, params.simName, params.locale );
            }
            else if ( buttonId === 'submit' ) {
              setIsDisabled( true );
              await submitTranslation( values, params.simName, params.locale, simTitle, localeName );
              setIsDisabled( false );
            }
            else if ( buttonId === 'test' ) {
              setTestIsLoading( true );
              await testTranslation( values, params.simName, params.locale );
              setTestIsLoading( false );
            }
            else if ( buttonId === 'automate' ) {
              setTestIsLoading( true );
              // Clear previous AI flags and flag each field as it's translated
              setAiTranslatedFields( new Set() );
              // Wrap Formik's setter to record AI-translated fields as they complete
              const aiSetFieldValue = ( field, value ) => {
                setFieldValue( field, value );
                setAiTranslatedFields( prev => new Set( prev ).add( field ) );
              };
              await automateTranslation( values, params.simName, params.locale, simTitle, localeName, aiSetFieldValue );
              setTestIsLoading( false );
            }
          }}
        >
          {props => {
            return (
              <Form>
                <TranslationFormButtons
                  simName={params.simName}
                  locale={params.locale}
                  handleButtonClick={handleButtonClick}
                  isDisabled={isDisabled}
                  testIsLoading={testIsLoading}
                  {...props}
                />
                <ErrorContext.Provider value={props.errors}>
                  <TranslationFormTables
                    translationFormData={translationFormData}
                    {...props}
                    locale={params.locale}
                    aiTranslatedFields={aiTranslatedFields}
                    setAiTranslatedFields={setAiTranslatedFields}
                  />
                </ErrorContext.Provider>
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