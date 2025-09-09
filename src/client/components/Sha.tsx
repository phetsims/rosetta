// Copyright 2022, University of Colorado Boulder

/**
 * Create a component that displays the SHA of the running instance of Rosetta. This should only be seen by
 * team members.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import React, { useEffect, useState } from 'react';
import { TRANSLATION_API_ROUTE } from '../../common/constants.js';
import Xerxes from '../img/xerxes.jpg';
import alertErrorMessage from '../js/alertErrorMessage.js';

type ShaResponse = {
  sha: string;
};

/**
 * Get the SHA of the running instance of Rosetta from the server and display it.
 */
const Sha: React.FC = () => {
  const [ sha, setSha ] = useState<ShaResponse | null>( null );

  useEffect( () => {
    ( async (): Promise<void> => {
      try {
        const response = await fetch( `${TRANSLATION_API_ROUTE}/sha` );
        if ( !response.ok ) {
          throw new Error( `HTTP error! Status: ${response.status}` );
        }
        const data = await response.json();
        setSha( data );
      }
      catch( e ) {
        await alertErrorMessage( e as string );
      }
    } )();

  }, [] );

  return (
    <div>
      <h2>SHA</h2>
      <img src={Xerxes} alt='Picture of Xerxes I'/>
      <p>The Great Shah says Rosetta's SHA is {sha?.sha}.</p>
    </div>
  );
};

export default Sha;