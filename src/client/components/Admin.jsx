// Copyright 2022, University of Colorado Boulder

/* eslint-disable react/no-unescaped-entities */

import { Field, Form, Formik } from 'formik';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

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

  const handleSubmit = values => {
    console.log( JSON.stringify( values, null, 2 ) );
  };

  if ( allowedAccess ) {
    jsx = (
      <div>
        <h1>Admin</h1>
        <p>
          If you aren't a PhET Team Member, you shouldn't be seeing this page. Please send an email to
          phethelp@colorado.edu to help us resolve this.
        </p>
        <h2>Trigger Build</h2>
        <Formik initialValues={{}} onSubmit={handleSubmit}>
          <Form>
            <div>
              <label className='mt-2'>Lowercase kebab sim name (e.g. acid-base-solutions):</label><br/>
              <Field type='text' name='sim'/>
            </div>
            <div>
              <label className='mt-2'>ISO 639-1 locale name (e.g. es for Spanish):</label><br/>
              <Field type='text' name='locale'/>
            </div>
            <div>
              <label className='mt-2'>User ID:</label><br/>
              <Field type='text' name='userId'/>
            </div>
            <button type='submit' className='btn btn-primary mt-2'>Trigger Build</button>
          </Form>
        </Formik>
      </div>
    );
  }
  else {
    jsx = (
      <div>
        <h1>Nothing to see here! :)</h1>
        Go back to the <p><Link to='/translate'>Translate</Link> page.</p>
      </div>
    );
  }
  return jsx;
};

export default Admin;