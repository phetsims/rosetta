// Copyright 2022, University of Colorado Boulder

import axios from 'axios';

const submitTranslation = async translation => {
  if ( window.confirm( `Are you sure you want to submit your translation for ${translation.simName} in locale ${translation.locale}?` ) ) {
    try {
      const postRes = await axios.post( '/translationApi/submitTranslation', translation );
      console.log( postRes.data );
      alert( 'Translation submitted. Your translation should appear on the PhET website in about half an hour.' );
    }
    catch( e ) {
      console.error( e );
    }
  }
};

export default submitTranslation;