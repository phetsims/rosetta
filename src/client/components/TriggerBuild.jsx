// Copyright 2022, University of Colorado Boulder

/**
 * Create a component with a form for rebuilding a simulation without crediting the "re-submitter" but instead
 * crediting the original translator. This is used only by Rosetta's maintainers.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import clientConstants from '../utils/clientConstants.js';
import { useContext } from 'react';
import { WebsiteUserDataContext } from './Rosetta.jsx';

/**
 * Create a Formik form for sending a get request based on the supplied sim, locale, and user ID.
 *
 * @returns {JSX.Element}
 */
const TriggerBuild = () => {
  const initialRebuildValues = {
    sim: '',
    locale: '',
    userId: ''
  };
  const websiteUserData = useContext( WebsiteUserDataContext );
  const handleSubmit = async values => {
    if ( websiteUserData.loggedIn && websiteUserData.teamMember ) {
      await axios.get( `${clientConstants.translationApiRoute}/triggerBuild/${values.sim}/${values.locale}/${values.userId}` );
      window.alert( `Rebuild request sent for sim ${values.sim} in locale ${values.locale} with user ID ${values.userId}.` );
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
    userId: Yup.number()
      .required( 'Required' )
      .positive( 'User ID should be a positive number' )
      .integer( 'User ID should be an integer' )
  } );
  const grayButton = 'btn btn-secondary mt-2';
  const blueButton = 'btn btn-primary mt-2';
  return (
    <div>
      <h2>Rebuild With Original Credit</h2>
      <p>
        See documentation for rebuilding a sim with original credit <a href='#'>here</a>.
      </p>
      <Formik initialValues={initialRebuildValues} onSubmit={handleSubmit} validationSchema={ValidationSchema}>
        {(
          {
            errors,
            touched,
            isValid,
            dirty
          } ) => (
          <Form>
            <div>
              <label className='mt-2'>Sim:</label><br/>
              <Field type='text' name='sim'/>
              {errors.sim && touched.sim ? errors.sim : null}
            </div>
            <div>
              <label className='mt-2'>Locale:</label><br/>
              <Field type='text' name='locale'/>
              {errors.locale && touched.locale ? errors.locale : null}
            </div>
            <div>
              <label className='mt-2'>User ID:</label><br/>
              <Field type='text' name='userId'/>
              {errors.userId && touched.userId ? errors.userId : null}
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