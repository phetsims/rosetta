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
import { TRANSLATION_API_ROUTE } from '../../common/constants.js';
import { useContext } from 'react';
import { WebsiteUserDataContext } from './Rosetta.jsx';

// eslint-disable-next-line bad-text
import '../styles/input-error.css';

/**
 * Create a Formik form for sending a get request based on the supplied sim, locale, and user ID.
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
      const triggerBuildRes = await axios.get( `${TRANSLATION_API_ROUTE}/triggerBuild/${values.sim}/${values.locale}/${values.userId}` );
      if ( triggerBuildRes.status >= 200 && triggerBuildRes.status < 300 ) {
        if ( triggerBuildRes.data === 'success' ) {
          window.alert( `Rebuild request sent for sim ${values.sim} in locale ${values.locale} with user ID ${values.userId}.` );
        }
        else if ( triggerBuildRes.data === 'failure' ) {
          window.alert( 'Rebuild request failed. Check the build request flag in your config.' );
        }
      }
      else {
        window.alert( 'Something went wrong. Build request not sent.' );
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
    userId: Yup.number()
      .required( 'Required' )
      .positive( 'User ID should be a positive number' )
      .integer( 'User ID should be an integer' )
  } );
  const grayButton = 'btn btn-secondary mt-2';
  const blueButton = 'btn btn-primary mt-2';
  return (
    <div>
      <h2>Trigger Build</h2>
      <p>
        See documentation for trigger build <a href='https://github.com/phetsims/rosetta/blob/master/doc/admin-guide.md#triggering-a-rebuild-without-being-credited'>here</a>.
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
              <Field type='text' name='userId'/>
              <div className='error-container'>
                {errors.userId && touched.userId ? errors.userId : null}
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