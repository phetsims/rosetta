// Copyright 2021, University of Colorado Boulder

/* eslint-disable no-undef */
/* eslint-disable prefer-const */

/**
 * We define the form for translations. Once the user has selected the locale and sim they want, they see this
 * component.
 *
 * @author Liam Mulhall
 */

import LoadingSpinner from './LoadingSpinner.jsx';
import React, { useEffect, useState } from 'react';
import TranslationFormHeader from './TranslationFormHeader.jsx';
import TranslationTables from './TranslationTables.jsx';
import axios from 'axios';
import saveTranslation from '../utils/saveTranslation.js';
import submitTranslation from '../utils/submitTranslation.js';
import testTranslation from '../utils/testTranslation.js';
import { Formik, Form } from 'formik';
import { useParams } from 'react-router-dom';

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

  // for storing and setting website user data
  const [ websiteUserData, setWebsiteUserData ] = useState( {} );

  // get website user data
  useEffect( async () => {
    try {
      const websiteUserDataRes = await axios.get( `${window.location.origin}/services/check-login` );
      setWebsiteUserData( websiteUserDataRes.data );
    }
    catch( e ) {
      console.error( e );
    }
  }, [] );

  // as of this writing, saving or submitting hits this function
  const handleSubmit = async values => {
    const translation = {
      userId: websiteUserData.userId,
      timestamp: Date.now(),
      simName: params.simName,
      locale: params.locale,
      translationFormData: values
    };
    if ( document.activeElement.dataset.flag === 'save' ) {
      await saveTranslation( translation );
    }
    else if ( document.activeElement.dataset.flag === 'submit' ) {
      await submitTranslation( translation );
    }
    else if ( document.activeElement.dataset.flag === 'test' ) {
      await testTranslation( translation );
    }
    else {
      console.error( 'unexpected dataset flag' );
    }
  };

  if ( translationFormData === null ) {
    return (
      <div>
        <TranslationFormHeader locale={params.locale} simName={params.simName}/>
        <LoadingSpinner/>
      </div>
    );
  }
  else {

    return (
      <div>
        <TranslationFormHeader locale={params.locale} simName={params.simName}/>
        <Formik
          initialValues={translationFormData}
          onSubmit={handleSubmit}
        >
          <Form>
            <div className='mt-2'>
              <button type='submit' data-flag='save' className='btn btn-primary'>
                Save Translation
              </button>
            </div>
            <div className='mt-2'>
              <button type='submit' data-flag='submit' className='btn btn-primary'>
                Submit Translation
              </button>
            </div>
            <div className='mt-2'>
              <button type='submit' data-flag='test' className='btn btn-primary'>
                Test Translation
              </button>
            </div>
            <TranslationTables translationFormData={translationFormData}/>
            <div className='mt-2'>
              <button type='submit' data-flag='save' className='btn btn-primary'>
                Save Translation
              </button>
            </div>
            <div className='mt-2'>
              <button type='submit' data-flag='submit' className='btn btn-primary'>
                Submit Translation
              </button>
            </div>
            <div className='mt-2'>
              <button type='submit' data-flag='test' className='btn btn-primary'>
                Test Translation
              </button>
            </div>
          </Form>
        </Formik>
      </div>
    );
  }
};

export default TranslationForm;