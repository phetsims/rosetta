// Copyright 2022, University of Colorado Boulder

import axios from 'axios';

const saveTranslation = async translation => {
  if ( window.confirm( `If you have a translation saved for ${translation.simName} in locale ${translation.locale}, it will be overwritten.` ) ) {
    try {
      const postRes = await axios.post( '/translationApi/saveTranslation', translation );
      console.log( postRes.data );

      // todo: change
      alert( 'Translation saved.' );
    }
    catch( e ) {
      console.error( e );
    }
  }
};

export default saveTranslation;