// Copyright 2022, University of Colorado Boulder

import alertErrorMessage from './alertErrorMessage.js';
import getWebsiteUserData from './getWebsiteUserData.js';

const makeTranslationObject = async ( values, simName, locale ) => {
  let translation;
  try {
    const websiteUserData = await getWebsiteUserData();
    translation = {
      userId: websiteUserData.userId,
      timestamp: Date.now(),
      simName: simName,
      locale: locale,
      translationFormData: values
    };
  }
  catch( e ) {
    alertErrorMessage( e );
    translation = { error: 'unable to make translation' };
  }
  return translation;
};

export default makeTranslationObject;