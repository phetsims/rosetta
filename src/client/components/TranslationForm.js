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
  const [ translationFormData, setTranslationFormData ] = useState( null );

  // get the translation form data for the selected locale and sim
  useEffect( () => {
    try {
      ( async () => {
        const translationFormDataRes = await axios.get( `/rosettaApi/translationFormData/${params.simName}/${params.locale}` );
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
        const postRes = await axios.post( '/rosettaApi/saveTranslation', translation );
        console.log( postRes.data );

        // todo: change
        alert( 'Translation saved.' );
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
        const postRes = await axios.post( '/rosettaApi/submitTranslation', translation );
        console.log( postRes.data );
        alert( 'Translation submitted. Your translation should appear on the PhET website in about half an hour. Redirecting you to the PhET Translation Tool home page.' );
        navigate( '/translate' );
      }
      catch( e ) {
        console.error( e );
      }
    }
  };

  // test functionality
  const test = async translation => {
    try {
      const testRes = await axios.post( '/rosettaApi/testTranslation', translation );
      const stringSimHtml = testRes.data;

      // Open the translated sim in a new tab.
      const win = window.open( '' );
      win.document.write( stringSimHtml );
    }
    catch( e ) {
      console.error( e );
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
    else if ( document.activeElement.dataset.flag === 'test' ) {
      await test( translation );
    }
  };

  if ( translationFormData === null ) {
    return (
      <div>
        <h1>Translation Form</h1>
        <h2 className='text-muted'>Locale: {params.locale}</h2>
        <h2 className='text-muted'>Sim: {params.simName}</h2>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
      </div>
    );
  }
  else {

    // as of this writing, both buttons submit the form; they use different flags to separate functionality
    return (
      <div>
        <h1>Translation Form</h1>
        <h2 className='text-muted'>Locale: {params.locale}</h2>
        <h2 className='text-muted'>Sim: {params.simName}</h2>
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