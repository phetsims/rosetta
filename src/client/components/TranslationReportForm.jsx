// Copyright 2022, University of Colorado Boulder

/**
 * We define the translation report form.
 *
 * @author Liam Mulhall
 */

import { Field, Form, Formik } from 'formik';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import LocaleSelect from './LocaleSelect.jsx';

/**
 * This component enables the user to select the locale they want a translation report for.
 *
 * @returns {JSX.Element}
 * @constructor
 */
const TranslationReportForm = () => {

  // used to programmatically navigate the user to the translation report page
  const navigate = useNavigate();

  return (
    <div>
      <h1>Select Locale</h1>
      <Formik
        initialValues={{ locale: 'ab' }}
        onSubmit={values => {
          alert( JSON.stringify( values, null, 2 ) );

          {/* navigate the user to the translation report page for the locale they selected when they submit */}
          navigate( `/translate/report/${values.locale}` );
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

export default TranslationReportForm;