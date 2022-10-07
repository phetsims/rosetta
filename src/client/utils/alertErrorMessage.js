// Copyright 2022, University of Colorado Boulder

const alertErrorMessage = error => {
  window.alert(
    `The translation utility experienced an error.
    
    Please contact phethelp@colorado.edu and include the error message below.
    
    Error Message:
    ${error}`
  );
};

export default alertErrorMessage;