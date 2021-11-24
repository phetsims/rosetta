// Copyright 2021, University of Colorado Boulder

import axios from 'axios';
import React, { useState } from 'react';
import RosettaRoutes from './RosettaRoutes.js';

function Rosetta() {

  const [ websiteUserData, setWebsiteUserData ] = useState( {} );
  ( async () => {
    try {
      const websiteUserDataRes = await axios.get( `${window.location.origin}/services/check-login` );
      setWebsiteUserData( websiteUserDataRes.data );
    }
    catch( e ) {
      console.error( e );
    }
  } )();

  return (
    <div>
      <h1>PhET Translation Tool</h1>
      {websiteUserData.loggedIn ? <RosettaRoutes/> : null}
    </div>
  );
}

export default Rosetta;