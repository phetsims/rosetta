// Copyright 2022, University of Colorado Boulder

import getSimTitles from '../getSimTitles.js';

const simTitles = async ( req, res ) => {
  res.json( await getSimTitles() );
};

export default simTitles;