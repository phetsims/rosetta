// Copyright 2022, University of Colorado Boulder

/**
 * Create a custom hook for getting website user data.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { useEffect, useState } from 'react';
import { LoginState } from '../../common/LoginState.js';
import alertErrorMessage from '../js/alertErrorMessage.js';
import getLoginState from '../js/getLoginState.js';

/**
 * Return the login state for the current user, which we ultimately get from the PhET website.
 */
const useLoginState = (): LoginState => {
  const [ loginState, setLoginState ] = useState<LoginState>( {} as LoginState );

  useEffect( () => {
    const fetchLoginState = async (): Promise<void> => {
      try {
        setLoginState( await getLoginState() );
      }
      catch( e ) {
        void alertErrorMessage( e as string );
      }
    };

    void fetchLoginState();
  }, [] );

  return loginState;
};

export default useLoginState;