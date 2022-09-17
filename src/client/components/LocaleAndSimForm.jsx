// Copyright 2021, University of Colorado Boulder

/**
 * We define the form for selecting the locale and sim to translate that is first displayed to a trusted translator
 * upon loading the translation tool.
 *
 * We use the Formik form library here for the sake of consistency.
 *
 * @author Liam Mulhall
 */

import LocaleSelect from './LocaleSelect.jsx';
import React from 'react';
import SimSelect from './SimSelect.jsx';
import { Formik, Form, Field } from 'formik';
import { useNavigate } from 'react-router-dom';

/**
 * This component is a Formik form that contains a select (commonly referred to as a dropdown) for the locale and a
 * select for the sim. It allows the user to select the locale/sim they would like to translate.
 *
 * @returns {JSX.Element}
 * @constructor
 */
const LocaleAndSimForm = () => {

  // used to programmatically navigate the user to the translation page
  const navigate = useNavigate();

  // since our list of locales comes from a file in the chipper repo, the first locale is unlikely to change
  // if we ever make a sim that comes before acid base solutions alphabetically, this will need to change
  return (
    <div>
      <h1>Select Locale and Sim</h1>
      <Formik
        initialValues={{ locale: 'ab', simName: 'acid-base-solutions' }}
        onSubmit={values => {

          {/* navigate the user to the translation page for the locale/sim they selected when they submit */}
          navigate( `/translate/${values.locale}/${values.simName}` );
        }}
      >
        <Form>
          <div className='mt-2'>
            <Field name='locale' component={LocaleSelect}/>
          </div>
          <div className='mt-2'>
            <Field name='simName' component={SimSelect}/>
          </div>
          <div className='mt-2'>
            <button type='submit' className='btn btn-primary'>
              Translate
            </button>
          </div>
        </Form>
      </Formik>
    </div>
  );
};

export default LocaleAndSimForm;