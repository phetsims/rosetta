// Copyright 2021, University of Colorado Boulder

/**
 * We define the form for translations. Once the user has selected the locale and sim they want, they see this
 * component.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import { Form, Formik } from 'formik';
// eslint-disable-next-line single-line-import
import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';
import { useParams, Link } from 'react-router-dom';
import publicConfig from '../../common/publicConfig.js';
import makeValidationSchema from '../js/makeValidationSchema.js';
import saveTranslation from '../js/saveTranslation.js';
import submitTranslation from '../js/submitTranslation.js';
import testTranslation from '../js/testTranslation.js';
import LoadingSpinner from './LoadingSpinner.jsx';
import { WebsiteUserDataContext } from './Rosetta.jsx';
import { LocaleInfoContext, SimNamesAndTitlesContext } from './RosettaRoutes.jsx';
import TranslationFormButtons from './TranslationFormButtons.jsx';
import TranslationFormHeader from './TranslationFormHeader.jsx';
import TranslationFormTables from './TranslationFormTables.jsx';

const ErrorContext = createContext( null );

/**
 * This component is a form with a table that is populated by the translation form data that we get from the backend.
 *
 * @returns {JSX.Element}
 * @constructor
 */
const TranslationForm = () => {

  const params = useParams();
  const websiteUserData = useContext( WebsiteUserDataContext );

  console.log( `__________>> websiteUserData = ${JSON.stringify( websiteUserData, null, 4 )}` );

  const [ translationFormData, setTranslationFormData ] = useState( null );
  useEffect( () => {
    try {
      ( async () => {
        const translationFormDataRes = await axios.get( `${publicConfig.translationApiRoute}/translationFormData/${params.simName}/${params.locale}?userId=${websiteUserData.userId}` );
        setTranslationFormData( translationFormDataRes.data );
      } )();
    }
    catch( e ) {
      console.error( e );
    }
  }, [ websiteUserData ] );

  const [ isDisabled, setIsDisabled ] = useState( false );
  const [ buttonId, setButtonId ] = useState( '' );
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
    const validationSchema = makeValidationSchema( translationFormData );
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
          onSubmit={async values => {
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
              await testTranslation( values, params.simName, params.locale );
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
                  {...props}
                />
                <ErrorContext.Provider value={props.errors}>
                  <TranslationFormTables
                    translationFormData={translationFormData}
                    {...props}
                    locale={params.locale}
                  />
                </ErrorContext.Provider>
                <TranslationFormButtons
                  simName={params.simName}
                  locale={params.locale}
                  handleButtonClick={handleButtonClick}
                  isDisabled={isDisabled}
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