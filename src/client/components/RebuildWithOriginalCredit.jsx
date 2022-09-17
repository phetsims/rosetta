// Copyright 2022, University of Colorado Boulder

import axios from 'axios';
import { Field, Form, Formik } from 'formik';

const RebuildWithOriginalCredit = () => {
  const initialRebuildValues = {
    sim: '',
    locale: '',
    userId: ''
  };
  const handleSubmit = async ( values, { setSubmitting } ) => {
    await axios.get( `/translationApi/rebuildWithOriginalCredit/${values.sim}/${values.locale}/${values.userId}` );
    window.alert( `Rebuild request sent for sim ${values.sim} in locale ${values.locale} with user ID ${values.userId}.` );
    setSubmitting( false );
  };
  return (
    <div>
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
};

export default RebuildWithOriginalCredit;