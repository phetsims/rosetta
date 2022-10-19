// Copyright 2022, University of Colorado Boulder

/* eslint-disable default-import-match-filename  */
/* eslint-disable react/no-unescaped-entities  */

import axios from 'axios';
import { useEffect, useState } from 'react';
import Xerxes from '../img/xerxes.jpg';

const Sha = () => {
  const [ sha, setSha ] = useState( '' );
  useEffect( async () => {
    try {
      const shaRes = await axios.get( '/translationApi/sha' );
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