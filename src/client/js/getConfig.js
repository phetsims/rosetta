// Copyright 2022, University of Colorado Boulder

import axios from 'axios';
import alertErrorMessage from './alertErrorMessage.js';

const getConfig = async () => {
  let config = { error: 'unable to get config' };
  try {
    const configRes = await axios.get( '/translate/api/clientConfig' );
    config = configRes.data;
    console.log( JSON.stringify( config, null, 4 ) );
  }
  catch( e ) {
    alertErrorMessage( e );
  }
  return config;
};

export default getConfig;