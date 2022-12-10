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
import clientConstants from '../utils/clientConstants.js';
import makeValidationSchema from '../utils/makeValidationSchema.js';
import saveTranslation from '../utils/saveTranslation.js';
import submitTranslation from '../utils/submitTranslation.js';
import testTranslation from '../utils/testTranslation.js';
import LoadingSpinner from './LoadingSpinner.jsx';
import { WebsiteUserDataContext } from './Rosetta.jsx';
import { LocaleInfoContext, SimNamesAndTitlesContext } from './RosettaRoutes.jsx';
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

  const params = useParams();
  const websiteUserData = useContext( WebsiteUserDataContext );

  const [ translationFormData, setTranslationFormData ] = useState( null );
  useEffect( () => {
    try {
      ( async () => {
        const translationFormDataRes = await axios.get( `${clientConstants.translationApiRoute}/translationFormData/${params.simName}/${params.locale}?userId=${websiteUserData.userId}` );
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
              await submitTranslation( values, params.simName, params.locale, simTitle, localeName );
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
                  {...props}
                />
                <ErrorContext.Provider value={props.errors}>
                  <TranslationTables
                    translationFormData={translationFormData}
                    {...props}
                    locale={params.locale}
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