// Copyright 2022, University of Colorado Boulder

const SignInInfo = props => {
  return (
    <div>
      {/* eslint-disable-next-line react/prop-types */}
      <p>Signed in as: {props.websiteUserData.email}</p>
    </div>
  );
};

export default SignInInfo;