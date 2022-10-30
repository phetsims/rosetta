// Copyright 2022, University of Colorado Boulder

import getDependencies from './getDependencies.js';

const getLatestSimSha = async simName => {
  const depsString = await getDependencies( simName, 'latest' );
  const depsObject = JSON.parse( depsString );
  return depsObject[ simName ].sha;
};

export default getLatestSimSha;