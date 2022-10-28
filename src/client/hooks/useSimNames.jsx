// Copyright 2022, University of Colorado Boulder

import axios from 'axios';
import { useEffect, useState } from 'react';

const useSimNames = () => {

  const [ simNames, setSimNames ] = useState( [] );
  useEffect( async () => {
    try {
      const simNamesRes = await axios.get( '/translationApi/simNames' );
      setSimNames( simNamesRes.data );
    }
    catch( e ) {
      console.error( e );
    }
  }, [] );
  return simNames;
};

export default useSimNames;