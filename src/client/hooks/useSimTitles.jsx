// Copyright 2022, University of Colorado Boulder

import axios from 'axios';
import { useEffect, useState } from 'react';

const useSimTitles = () => {

  const [ simTitles, setSimTitles ] = useState( [] );
  useEffect( async () => {
    try {
      const simTitlesRes = await axios.get( '/translationApi/simTitles' );
      setSimTitles( simTitlesRes.data );
    }
    catch( e ) {
      console.error( e );
    }
  }, [] );
  return simTitles;
};

export default useSimTitles;