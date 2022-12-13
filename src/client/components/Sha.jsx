// Copyright 2022, University of Colorado Boulder

/**
 * Create a component that displays the SHA of the running instance of Rosetta. This should only be seen by
 * team members.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import { useEffect, useState } from 'react';
import Xerxes from '../img/xerxes.jpg';
import publicConfig from '../../common/publicConfig.js';

/**
 * Get the SHA of the running instance of Rosetta from the server and display it.
 *
 * @returns {JSX.Element}
 */
const Sha = () => {
  const [ sha, setSha ] = useState( '' );
  useEffect( async () => {
    try {
      const shaRes = await axios.get( `${publicConfig.translationApiRoute}/sha` );
      setSha( shaRes.data );
    }
    catch( e ) {
      console.error( e );
    }
  }, [] );
  return (
    <div>
      <h2>SHA</h2>
      <img src={Xerxes} alt='Picture of Xerxes I'/>
      <p>The Great Shah says Rosetta's SHA is {sha.sha}.</p>
    </div>
  );
};

export default Sha;