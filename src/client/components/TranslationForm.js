// Copyright 2021, University of Colorado Boulder

/* eslint-disable no-undef */
/* eslint-disable prefer-const */

import React, { useEffect, useState } from 'react';
import TranslationTable from './TranslationTable.js';
import axios from 'axios';
import { Formik, Form } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';

const TranslationForm = () => {

  const params = useParams();

  const [ translationFormData, setTranslationFormData ] = useState( [] );
  useEffect( () => {
    try {
      ( async () => {
        const translationFormDataRes = await axios.get( `/translate/api/translationFormData/${params.sim}/${params.locale}` );
        setTranslationFormData( translationFormDataRes.data );
      } )();
    }
    catch( e ) {
      console.error( e );
    }
  }, [] );

  const navigate = useNavigate();

  const save = async translation => {
    if ( window.confirm( `If you have a translation saved for ${translation.sim} in locale ${translation.locale}, it will be overwritten.` ) ) {
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

  const submit = async translation => {
    if ( window.confirm( `Are you sure you want to submit your translation for ${translation.sim} in locale ${translation.locale}?` ) ) {
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

  const handleSubmit = async values => {
    const translation = {
      userId: 123456,
      sim: params.sim,
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

  return (
    <Formik
      enableReinitialize={true}
      initialValues={translationFormData}
      onSubmit={handleSubmit}
    >
      <Form>
        <TranslationTable translationFormData={translationFormData}/>
        <button type='submit' data-flag='save'>
          Save Translation
        </button>
        <button type='submit' data-flag='submit'>
          Submit Translation
        </button>
      </Form>
    </Formik>
  );
};

export default TranslationForm;