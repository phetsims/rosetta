// Copyright 2021, University of Colorado Boulder

/* eslint-disable no-undef */
/* eslint-disable prefer-const */

/**
 * We define the form for translations. Once the user has selected the locale and sim they want, they see this
 * component.
 *
 * @author Liam Mulhall
 */

import React, { useEffect, useState } from 'react';
import TranslationTables from './TranslationTables.js';
import axios from 'axios';
import { Formik, Form } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';

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
  const [ translationFormData, setTranslationFormData ] = useState( [] );

  // get the translation form data for the selected locale and sim
  useEffect( () => {
    try {
      ( async () => {
        const translationFormDataRes = await axios.get( `/translate/api/translationFormData/${params.simName}/${params.locale}` );
        setTranslationFormData( translationFormDataRes.data );
      } )();
    }
    catch( e ) {
      console.error( e );
    }
  }, [] );

  // used to programmatically navigate the user to the translation page
  const navigate = useNavigate();

  // save functionality
  const save = async translation => {
    if ( window.confirm( `If you have a translation saved for ${translation.simName} in locale ${translation.locale}, it will be overwritten.` ) ) {
      try {
        const postRes = await axios.post( '/translate/api/saveTranslation', translation );
        console.log( postRes.data );
        alert( 'Translation saved. Redirecting you to the PhET Translation Tool home page.' );
        navigate( '/translate' );
      }
      catch( e ) {
        console.error( e );
      }
    }
  };

  // submit functionality
  const submit = async translation => {
    if ( window.confirm( `Are you sure you want to submit your translation for ${translation.simName} in locale ${translation.locale}?` ) ) {
      try {
        const postRes = await axios.post( '/translate/api/submitTranslation', translation );
        console.log( postRes.data );
        alert( 'Translation submitted. Your translation should appear on the PhET website in about half an hour. Redirecting you to the PhET Translation Tool home page.' );
        navigate( '/translate' );
      }
      catch( e ) {
        console.error( e );
      }
    }
  };

  // as of this writing, saving or submitting hits this function
  const handleSubmit = async values => {
    const translation = {
      userId: 123456,
      timestamp: Date.now(),
      simName: params.simName,
      locale: params.locale,
      translationFormData: values
    };
    if ( document.activeElement.dataset.flag === 'save' ) {
      await save( translation );
    }
    else if ( document.activeElement.dataset.flag === 'submit' ) {
      await submit( translation );
    }
  };

  // we need to be able to reinitialize because the translation form data is initially empty
  // as of this writing, both buttons submit the form; they use different flags to separate functionality
  return (
    <Formik
      enableReinitialize={true}
      initialValues={translationFormData}
      onSubmit={handleSubmit}
    >
      <Form>
        <TranslationTables translationFormData={translationFormData}/>
        <button type='submit' data-flag='save' className='btn btn-primary m-2'>
          Save Translation
        </button>
        <button type='submit' data-flag='submit' className='btn btn-primary m-2'>
          Submit Translation
        </button>
      </Form>
    </Formik>
  );
};

export default TranslationForm;