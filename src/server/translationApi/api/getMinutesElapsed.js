// Copyright 2022, University of Colorado Boulder

const getMinutesElapsed = ( millisecondsA, millisecondsB ) => {
  return ( millisecondsB - millisecondsA ) / 1000 / 60;
};

export default getMinutesElapsed;