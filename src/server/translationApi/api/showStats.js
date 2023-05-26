// Copyright 2023, University of Colorado Boulder

// When done, uncomment the following line.
// import getRemainingGHRequests from '../getRemainingGHRequests.js';

// We can make 5000 requests per hour, and there are about 100 sims.
// A typical sim requires 8 requests to get its translation report,
// so one translation report requires about 800 requests. Of course,
// this number will increase as we publish more sims.
const REQUEST_LIMIT = 900;

/**
 * Rosetta relies heavily on interactions with GitHub because it uses the
 * phetsims/babel repo to store translations. GitHub has a rate limit of 5000
 * requests per hour. This endpoint shows whether Rosetta is in danger
 * of exceeding that limit. For more info on this, see
 * https://github.com/phetsims/rosetta/issues/410. Specifically, see
 * https://github.com/phetsims/rosetta/issues/410#issuecomment-1563781403.
 *
 * This route is meant to be used by the client-side code that deals with
 * the translation report.
 *
 * @param req - Express request object
 * @param res - Express response object
 */
const showStats = async ( req, res ) => {
  const remainingGHRequests = 800; // When done, make this: await getRemainingGHRequests();
  res.send( remainingGHRequests > REQUEST_LIMIT );
};

export default showStats;