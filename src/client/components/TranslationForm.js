// Copyright 2021, University of Colorado Boulder

/* eslint-disable indent */

import InfoAndInput from './InfoAndInput.js';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Formik, Form } from 'formik';
import { useParams } from 'react-router-dom';

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

  const [ simSpecificInfoAndInputs, setSimSpecificInfoAndInputs ] = useState( [] );
  const [ commonInfoAndInputs, setCommonInfoAndInputs ] = useState( [] );
  useEffect( () => {
    for ( const stringKeyWithoutDots in translationFormData.simSpecific ) {
      const englishString = translationFormData.simSpecific[ stringKeyWithoutDots ].english;
      const stringKeyWithDots = stringKeyWithoutDots.split( '_DOT_' ).join( '.' );
      setSimSpecificInfoAndInputs( simSpecificInfoAndInputs => [ ...simSpecificInfoAndInputs,
        <InfoAndInput
          key={stringKeyWithDots}
          name={`simSpecific.${stringKeyWithoutDots}.translated`}
          stringKey={stringKeyWithDots}
          englishString={englishString}
        />
      ] );
    }
    for ( const stringKeyWithoutDots in translationFormData.common ) {
      const englishString = translationFormData.common[ stringKeyWithoutDots ].english;
      const stringKeyWithDots = stringKeyWithoutDots.split( '_DOT_' ).join( '.' );
      setCommonInfoAndInputs( commonInfoAndInputs => [ ...commonInfoAndInputs,
        <InfoAndInput
          key={stringKeyWithDots}
          name={`common.${stringKeyWithoutDots}.translated`}
          stringKey={stringKeyWithDots}
          englishString={englishString}
        />
      ] );
    }
  }, [ translationFormData ] );

  // todo: get conditional rendering of info and inputs to work
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
        ( async () => {
          if ( document.activeElement.dataset.flag === 'save' ) {
            window.confirm( `If you have a translation saved for ${params.sim} in locale ${params.locale}, it will be overwritten.` );
            const postRes = await axios.post( '/translate/api/saveTranslation', translation );
            console.log( postRes.data );
          }
          else if ( document.activeElement.dataset.flag === 'submit' ) {
            const postRes = await axios.post( '/translate/api/submitTranslation', translation );
            console.log( postRes.data );
          }
        } )();
      }}
    >
      <Form>
        <h2>Sim-Specific Strings</h2>
        <h3>(Translating these strings will only affect the selected simulation.)</h3>
        {!simSpecificInfoAndInputs ? <p>Loading...</p> : simSpecificInfoAndInputs}
        <h2>Common Strings</h2>
        <h3>(Translating these strings will affect multiple simulations.)</h3>
        {!commonInfoAndInputs ? <p>Loading...</p> : commonInfoAndInputs}
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