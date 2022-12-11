// Copyright 2022, University of Colorado Boulder

/**
 * Use the client-side config for Rosetta.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import { useEffect, useState } from 'react';
import alertErrorMessage from '../js/alertErrorMessage.js';

/**
 * Return the client-side config object.
 *
 * @returns {Object} - the client-side config
 */
const useConfig = () => {
  const [ config, setConfig ] = useState( {} );
  useEffect( async () => {
    try {
      const configRes = await axios.get( '/translate/api/clientConfig' );
      setConfig( configRes.data );
      console.log( JSON.stringify( config, null, 4 ) );
    }
    catch( e ) {
      alertErrorMessage( e );
    }
  }, [] );
  return config;
};

export default useConfig;