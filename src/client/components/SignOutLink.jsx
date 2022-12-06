// Copyright 2022, University of Colorado Boulder

/**
 * Create a component with a sign-out link.
 *
 * @author <liammulh@gmail.com>
 */

/**
 * Return a re-usable sign-out link. (Easier to have the component than typing out the whole URL every time
 * you need it.)
 *
 * @returns {JSX.Element}
 */
const SignOutLink = () => {
  return <a href={`${window.location.origin}/en/sign-out`}>Sign Out</a>;
};

export default SignOutLink;