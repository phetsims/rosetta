// Copyright 2022, University of Colorado Boulder

/**
 * Create a component with a form for rebuilding a simulation without crediting the 're-submitter' but instead
 * crediting the original translator. This is used only by Rosetta's maintainers.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { Field, Form, Formik, FormikHelpers } from 'formik';
import React, { useContext } from 'react';
import * as Yup from 'yup';
import { TRANSLATION_API_ROUTE } from '../../common/constants.js';
import { LoginStateContext } from './Rosetta.jsx';
import '../styles/input-error.css';

type RebuildFormValues = {
  sim: string;
  locale: string;
  phetUserId: string;
};

/**
 * Create a Formik form for sending a get request based on the supplied sim, locale, and user ID.
 */
const TriggerBuild: React.FC = () => {
  const initialRebuildValues: RebuildFormValues = {
    sim: '',
    locale: '',
    phetUserId: ''
  };

  const loginState = useContext( LoginStateContext );

  const handleSubmit = async ( values: RebuildFormValues, _: FormikHelpers<RebuildFormValues> ): Promise<void> => {
    if ( loginState.loggedIn && loginState.isTeamMember ) {
      try {
        const response = await fetch( `${TRANSLATION_API_ROUTE}/triggerBuild/${values.sim}/${values.locale}/${values.phetUserId}` );

        if ( response.ok ) {
          const data = await response.text();
          if ( data === 'success' ) {
            window.alert( `Rebuild request sent for sim ${values.sim} in locale ${values.locale} with user ID ${values.phetUserId}.` );
          }
          else if ( data === 'failure' ) {
            window.alert( 'Rebuild request failed. Check the build request flag in your config.' );
          }
        }
        else {
          window.alert( 'Something went wrong. Build request not sent.' );
        }
      }
      catch( error ) {
        window.alert( 'Network error. Build request not sent.' );
      }
    }
    else {
      window.alert( 'You do not have correct permissions (logged in and PhET team member) to trigger a build' );
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
      .max( 5, 'Too long' ),
    phetUserId: Yup.number()
      .required( 'Required' )
      .positive( 'User ID should be a positive number' )
      .integer( 'User ID should be an integer' )
  } );

  const grayButton = 'btn btn-secondary mt-2';
  const blueButton = 'btn btn-primary mt-2';

  return (
    <div className='mt-4'>
      <h2>Trigger Build</h2>
      <p>
        See documentation for trigger build <a href='https://github.com/phetsims/rosetta/blob/main/doc/admin-guide.md#triggering-a-rebuild-without-being-credited'>here</a>.
      </p>
      <Formik initialValues={initialRebuildValues} onSubmit={handleSubmit} validationSchema={ValidationSchema}>
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
            <div>
              <label className='mt-2'>User ID:</label><br/>
              <Field type='text' name='phetUserId'/>
              <div className='error-container'>
                {errors.phetUserId && touched.phetUserId ? errors.phetUserId : null}
              </div>
            </div>
            <button
              type='submit'
              disabled={!( isValid && dirty )}
              className={!( isValid && dirty ) ? grayButton : blueButton}>Rebuild
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default TriggerBuild;