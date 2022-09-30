// Copyright 2022, University of Colorado Boulder

const InputErrorMessage = ( { errors, touched, fieldKey } ) => {
  let jsx;
  const divStyle = {
    color: 'red'
  };

  /*
  touched: {
    simSpecific: {
      pH: { translated: true }
  */
  // TODO: Change conditional to reflect true shape of errors and touched objects.
  if ( errors[ fieldKey ] && touched[ fieldKey ] ) {
    jsx = <div style={divStyle}>{errors[ fieldKey ]}</div>;
  }
  else {
    jsx = null;
  }
  return jsx;
};

export default InputErrorMessage;