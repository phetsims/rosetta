// Copyright 2021, University of Colorado Boulder

import LocaleSelect from './LocaleSelect.js';
import React from 'react';
import SimSelect from './SimSelect.js';
import { Formik, Form, Field } from 'formik';
import { useNavigate } from 'react-router-dom';

const LocaleAndSimForm = () => {
  const navigate = useNavigate();
  return (
    <Formik
      initialValues={{ locale: 'ab', sim: 'acid-base-solutions' }}
      onSubmit={values => {
        alert( JSON.stringify( values, null, 2 ) );
        navigate( `/translate/${values.locale}/${values.sim}` );
      }}
    >
      <Form>
        <div>
          <Field name='locale' component={LocaleSelect}/>
        </div>
        <div>
          <Field name='sim' component={SimSelect}/>
        </div>
        <div>
          <button type='submit'>
            Translate
          </button>
        </div>
      </Form>
    </Formik>
  );
};

export default LocaleAndSimForm;