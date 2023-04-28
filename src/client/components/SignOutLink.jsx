// Copyright 2022, University of Colorado Boulder

/* eslint-disable */

/**
 * Create a component with a sign-out link.
 *
 * @author <liammulh@gmail.com>
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import signOut from '../js/signOut.js';

/**
 * Return a re-usable sign-out button.
 */
const SignOutLink = () => {
  const [ isSending, setIsSending ] = useState( false );
  const isMounted = useRef( true );

  // Set isMounted to false when we unmount the component.
  useEffect( () => {
    return () => {
      isMounted.current = false;
    };
  } );

  const sendRequest = useCallback( async () => {
    if ( isSending ) {
      return;
    }
    else {
      setIsSending( true );
      await signOut();
      if ( isMounted.current ) {
        setIsSending( false );
      }
    }
  }, [ isSending ] );

  return (
    <button disabled={isSending} onClick={ sendRequest }>Sign Out</button>
  );
};

export default SignOutLink;