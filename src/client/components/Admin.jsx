// Copyright 2022, University of Colorado Boulder

/* eslint-disable react/no-unescaped-entities */

import axios from 'axios';
import { Field, Form, Formik } from 'formik';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Admin = () => {

  // for storing and setting website user data
  const [ websiteUserData, setWebsiteUserData ] = useState( {} );

  // get website user data
  useEffect( async () => {
    try {
      const websiteUserDataRes = await axios.get( `${window.location.origin}/services/check-login` );
      setWebsiteUserData( websiteUserDataRes.data );
    }
    catch( e ) {
      console.error( e );
    }
  }, [] );

  let jsx;
  const allowedAccess = websiteUserData.loggedIn && websiteUserData.teamMember;

  const initialRebuildValues = {
    sim: '',
    locale: '',
    userId: ''
  };

  const handleSubmit = ( values, { setSubmitting } ) => {
    console.log( JSON.stringify( values, null, 2 ) );
    setSubmitting( false );
  };

  if ( allowedAccess ) {
    jsx = (
      <div>
        <h1>Admin</h1>
        <p>
          If you aren't a PhET Team Member, you shouldn't be seeing this page. Please send an email to
          phethelp@colorado.edu to help us resolve this.
        </p>
        <h2>Rebuild With Original Credit</h2>
        <p>
          See documentation for rebuilding a sim with original credit <a href='#'>here</a>.
        </p>
        <Formik initialValues={initialRebuildValues} onSubmit={handleSubmit}>
          {( { isSubmitting } ) => (
            <Form>
              <div>
                <label className='mt-2'>Sim:</label><br/>
                <Field type='text' name='sim'/>
              </div>
              <div>
                <label className='mt-2'>Locale:</label><br/>
                <Field type='text' name='locale'/>
              </div>
              <div>
                <label className='mt-2'>User ID:</label><br/>
                <Field type='text' name='userId'/>
              </div>
              <button type='submit' disabled={isSubmitting} className='btn btn-primary mt-2'>Rebuild</button>
            </Form>
          )}
        </Formik>
      </div>
    );
  }
  else {
    jsx = (
      <div>
        <h1>Nothing to see here! :)</h1>
        <p>Go back to the <Link to='/translate'>Translate</Link> page.</p>
      </div>
    );
  }
  return jsx;
};

export default Admin;