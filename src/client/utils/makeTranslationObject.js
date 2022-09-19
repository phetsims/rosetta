// Copyright 2022, University of Colorado Boulder

import axios from 'axios';

const makeTranslationObject = async ( values, simName, locale ) => {
  let translation;
  try {
    const websiteUserDataRes = await axios.get( `${window.location.origin}/services/check-login` );
    const websiteUserData = websiteUserDataRes.data;
    translation = {
      userId: websiteUserData.userId,
      timestamp: Date.now(),
      simName: simName,
      locale: locale,
      translationFormData: values
    };
  }
  catch( e ) {
    console.error( e );
    translation = { error: 'unable to make translation' };
  }
  return translation;
};

export default makeTranslationObject;