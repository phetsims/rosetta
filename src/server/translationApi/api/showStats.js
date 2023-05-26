// Copyright 2023, University of Colorado Boulder

// When done, uncomment the following line.
// import getRemainingGHRequests from '../getRemainingGHRequests.js';

const REQUEST_LIMIT = 900;

const showStats = async ( req, res ) => {
  const remainingGHRequests = 800; // When done, make this: await getRemainingGHRequests();
  res.send( remainingGHRequests > REQUEST_LIMIT );
};

export default showStats;