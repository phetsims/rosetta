// Copyright 2022, University of Colorado Boulder

/**
 * Placeholder for translation statistics.
 *
 * @author Liam Mulhall
 */

import LocaleSelect from './LocaleSelect.js';
import React from 'react';
import { Field, Form, Formik } from 'formik';

/**
 * This component is a placeholder for what will eventually be the translation statistics component.
 *
 * @returns {JSX.Element}
 * @constructor
 */
const TranslationReport = () => {

  return (
    <div>
      <h1>Select Locale</h1>
      <Formik
        initialValues={{ locale: 'ab' }}
        onSubmit={values => {
          alert( JSON.stringify( values, null, 2 ) );
          console.log( 'hi' );
        }}
      >
        <Form>
          <div className='mt-2'>
            <Field name='locale' component={LocaleSelect}/>
          </div>
          <div className='mt-2'>
            <button type='submit' className='btn btn-primary'>
              Get Translation Report
            </button>
          </div>
        </Form>
      </Formik>
    </div>
  );
};

export default TranslationReport;