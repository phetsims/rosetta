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

  return (
    <Formik
      enableReinitialize={true}
      initialValues={translationFormData}
      onSubmit={values => {
        console.log( JSON.stringify( values, null, 2 ) );
        const translation = {
          userId: 123456,
          sim: params.sim,
          locale: params.locale,
          translationFormData: values
        };
        const [ saved, setSaved ] = useState( false );
        const [ submitted, setSubmitted ] = useState( false );
        useEffect( async () => {
          if ( document.activeElement.dataset.flag === 'save' ) {
            let wantsToSave = window.confirm( `If you have a translation saved for ${params.sim} in locale ${params.locale}, it will be overwritten.` );
            if ( wantsToSave ) {
              const postRes = await axios.post( '/translate/api/saveTranslation', translation );
              console.log( postRes.data );
              setSaved( true );
            }
          }
          else if ( document.activeElement.dataset.flag === 'submit' ) {
            let wantsToSubmit = window.confirm( `Are you sure you want to submit your translation for ${params.sim} in locale ${params.locale}?` );
            if ( wantsToSubmit ) {
              const postRes = await axios.post( '/translate/api/submitTranslation', translation );
              console.log( postRes.data );
              setSubmitted( true );
            }
          }
        } );
        if ( saved ) {
          alert( 'Translation saved. Redirecting you to the PhET Translation Tool home page.' );
          navigate( '/translate' );
        }
        else if ( submitted ) {
          alert( 'Translation submitted. Your translation should appear on the PhET website in about half an hour. Redirecting you to the PhET Translation Tool home page.' );
          navigate( '/translate' );
        }
      }}
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