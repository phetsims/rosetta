// Copyright 2022, University of Colorado Boulder

import getSimMetadata from '../getSimMetadata.js';
import getSimNamesAndTitles from '../getSimNamesAndTitles.js';

const simNamesAndTitles = async ( req, res ) => {
  res.json( getSimNamesAndTitles( await getSimMetadata() ) );
};

export default simNamesAndTitles;