// Copyright 2022, University of Colorado Boulder

import axios from 'axios';
import { useState, useEffect } from 'react';

const useSimNamesAndTitles = () => {

  const [ simNamesAndTitles, setSimNamesAndTitles ] = useState( [] );
  useEffect( async () => {
    try {
      const simTitlesRes = await axios.get( '/translationApi/simNamesAndTitles' );
      setSimNamesAndTitles( simTitlesRes.data );
    }
    catch( e ) {
      console.error( e );
    }
  }, [] );
  return simNamesAndTitles;
};

export default useSimNamesAndTitles;