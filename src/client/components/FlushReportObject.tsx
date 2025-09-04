// Copyright 2023, University of Colorado Boulder

/**
 * This component allows users to flush a report object for a specific sim and locale.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { Field, Form, Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';
import { TRANSLATION_API_ROUTE } from '../../common/constants.js';

type FormValues = {
  sim: string;
  locale: string;
};

const FlushReportObject: React.FC = () => {
  const initialValues: FormValues = {
    sim: '',
    locale: ''
  };

  const handleSubmit = async ( values: FormValues ) => {
    try {
      const response = await fetch( `${TRANSLATION_API_ROUTE}/flushReportObject/${values.locale}/${values.sim}` );

      if ( response.ok ) {
        const data = await response.text();
        if ( data === 'success' ) {
          window.alert( `Report object flushed for sim ${values.sim} in locale ${values.locale}.` );
        }
        else if ( data === 'failure' ) {
          window.alert( 'Report object flush failed.' );
        }
      }
      else {
        window.alert( 'Something went wrong. Report object not flushed.' );
      }
    }
    catch( error ) {
      window.alert( 'Request failed. Report object not flushed.' );
    }
  };

  const ValidationSchema = Yup.object().shape( {
    sim: Yup.string()
      .required( 'Required' )
      .lowercase( 'Sim name should be lowercase' )
      .matches( /^[a-z]/, 'The first character must be lowercase, e.g. acid-base-solutions' ),
    locale: Yup.string()
      .required( 'Required' )
      .min( 2, 'Too short' )
      .max( 5, 'Too long' )
  } );

  const grayButton = 'btn btn-secondary mt-2';
  const blueButton = 'btn btn-primary mt-2';

  return (
    <div className='mt-4'>
      <h2>Flush Report Object</h2>
      <p>
        See documentation for flushing a report object <a href='https://github.com/phetsims/rosetta/blob/main/doc/admin-guide.md#update-translation-stats'>here</a>.
      </p>
      <Formik<FormValues>
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={ValidationSchema}
      >
        {( {
             errors,
             touched,
             isValid,
             dirty
           } ) => (
          <Form>
            <div>
              <label className='mt-2'>Sim:</label><br/>
              <Field type='text' name='sim'/>
              <div className='error-container'>
                {errors.sim && touched.sim ? errors.sim : null}
              </div>
            </div>
            <div>
              <label className='mt-2'>Locale:</label><br/>
              <Field type='text' name='locale'/>
              <div className='error-container'>
                {errors.locale && touched.locale ? errors.locale : null}
              </div>
            </div>
            <button
              type='submit'
              disabled={!( isValid && dirty )}
              className={!( isValid && dirty ) ? grayButton : blueButton}
            >
              Flush
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default FlushReportObject;