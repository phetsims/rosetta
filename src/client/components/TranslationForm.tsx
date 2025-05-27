// Copyright 2021, University of Colorado Boulder

/**
 * We define the form for translations. Once the user has selected the locale and sim they want, they see this
 * component.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import React, { createContext, ReactElement, useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { TRANSLATION_API_ROUTE } from '../../common/constants';
import { ErrorContextType, LocaleInfo, SimNamesAndTitles, TranslationFormData as ClientTranslationFormData, WebsiteUserData } from '../clientTypes';
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

type TranslationFormParams = {
  simName: string;
  locale: string;
};

// Using the imported type from clientTypes
const ErrorContext = createContext<ErrorContextType>( null );

/**
 * This component is a form with a table that is populated by the translation form data that we get from the backend.
 */
const TranslationForm: React.FC = (): ReactElement => {
  const params = useParams<TranslationFormParams>();
  const websiteUserData = useContext<WebsiteUserData>( WebsiteUserDataContext );

  const [ translationFormData, setTranslationFormData ] = useState<ClientTranslationFormData | null>( null );

  useEffect( () => {
    const fetchData = async (): Promise<void> => {
      try {
        const response = await fetch( `${TRANSLATION_API_ROUTE}/translationFormData/${params.simName}/${params.locale}?userId=${websiteUserData.userId}` );
        if ( response.ok ) {
          const data = await response.json();
          setTranslationFormData( data );
        }
        else {
          throw new Error( `Error fetching translation form data: ${response.statusText}` );
        }
      }
      catch( e ) {
        void alertErrorMessage( e as string );
      }
    };

    void fetchData();
  }, [ params.simName, params.locale, websiteUserData.userId ] );

  const [ isDisabled, setIsDisabled ] = useState<boolean>( false );
  const [ buttonId, setButtonId ] = useState<string>( '' );
  const [ testIsLoading, setTestIsLoading ] = useState<boolean>( false );

  // Track AI-translated fields for metadata and styling
  const [ aiTranslatedFields, setAiTranslatedFields ] = useState<Set<string>>( new Set() );

  // Reset AI-translated metadata when form data changes
  useEffect( () => {
    setAiTranslatedFields( new Set() );
  }, [ translationFormData ] );

  const handleButtonClick = ( evt: React.MouseEvent<HTMLButtonElement> ): void => {
    setButtonId( evt.currentTarget.id );
  };

  const simNamesAndTitles = useContext<SimNamesAndTitles>( SimNamesAndTitlesContext );
  let simTitle = 'Loading...';
  if ( Object.keys( simNamesAndTitles ).length > 0 && params.simName ) {
    simTitle = simNamesAndTitles[ params.simName ];
  }

  const localeInfo = useContext<LocaleInfo>( LocaleInfoContext );
  let localeName = 'Loading...';
  if ( Object.keys( localeInfo ).length > 0 && params.locale ) {
    localeName = localeInfo[ params.locale ].name;
  }

  let translationFormJsx: ReactElement;
  if ( translationFormData === null ) {
    translationFormJsx = (
      <div>
        <TranslationFormHeader
          localeName={localeName}
          locale={params.locale || ''}
          simTitle={simTitle}
        />
        <LoadingSpinner/>
      </div>
    );
  }
  else {
    // Make the Formik form validation schema.
    const validationSchema = makeValidationSchema( params.simName || '', translationFormData );
    translationFormJsx = (
      <div>
        <TranslationFormHeader
          localeName={localeName}
          locale={params.locale || ''}
          simTitle={simTitle}
        />
        <Link to={`/translate/${params.locale}`}>Back to {localeName} ({params.locale}) Sim List</Link>
        <Formik
          initialValues={translationFormData}
          validationSchema={validationSchema}
          onSubmit={async ( values: ClientTranslationFormData, { setFieldValue }: FormikHelpers<ClientTranslationFormData> ) => {
            if ( buttonId === '' ) {
              console.error( 'unable to get button id' );
            }
            else if ( buttonId === 'save' ) {
              await saveTranslation( values, params.simName || '', params.locale || '' );
            }
            else if ( buttonId === 'submit' ) {
              setIsDisabled( true );
              await submitTranslation( values, params.simName || '', params.locale || '', simTitle, localeName );
              setIsDisabled( false );
            }
            else if ( buttonId === 'test' ) {
              setTestIsLoading( true );
              await testTranslation( values, params.simName || '', params.locale || '' );
              setTestIsLoading( false );
            }
            else if ( buttonId === 'automate' ) {
              setTestIsLoading( true );
              setAiTranslatedFields( new Set() );

              const aiSetFieldValue = ( field: string, value: string | boolean ): void => {
                void setFieldValue( field, value );
                setAiTranslatedFields( prev => new Set( [ ...prev, field ] ) );
              };

              await automateTranslation(
                values,
                params.simName || '',
                params.locale || '',
                simTitle,
                localeName,
                aiSetFieldValue
              );

              setTestIsLoading( false );
            }
          }}
        >
          {( props: FormikProps<ClientTranslationFormData> ) => {
            // Convert Formik errors to compatible format for ErrorContext
            const contextErrors: ErrorContextType = Object.keys( props.errors ).length > 0 ?
                                                    props.errors as unknown as ErrorContextType : null;

            return (
              <Form>
                <TranslationFormButtons
                  simName={params.simName || ''}
                  locale={params.locale || ''}
                  handleButtonClick={handleButtonClick}
                  isDisabled={isDisabled}
                  testIsLoading={testIsLoading}
                  {...props}
                />
                <ErrorContext.Provider value={contextErrors}>
                  <TranslationFormTables
                    translationFormData={translationFormData}
                    {...props}
                    locale={params.locale || ''}
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