// Copyright 2025, University of Colorado Boulder

/**
 * Shared type definition for the website login state.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

// For getLoginState and others.  This is a subset of the data returned by the server when a user is logged in, and
// consists of just the user login state information needed by Rosetta.
// TODO: At some point this should be consolidated with the website type definitions, see https://github.com/phetsims/website-meteor/issues/914
//       and also (because it is somewhat related) https://github.com/phetsims/rosetta/issues/452.
export type LoginState = {
  loggedIn: boolean;

  // TODO: See https://github.com/phetsims/website-meteor/issues/914.  It may now be possible to make this always a
  //       number and remove the string bit.  Test and find out, remove if possible.
  phetUserId?: number | string;
  email?: string;
  isTrustedTranslator?: boolean;
  isTeamMember?: boolean;
};