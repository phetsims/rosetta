// Copyright 2022, University of Colorado Boulder

const InputErrorMessage = ( { errors, touched, fieldKey } ) => {
  let jsx;
  const divStyle = {
    color: 'red'
  };
  if ( errors[ fieldKey ] && touched[ fieldKey ] ) {
    jsx = <div style={divStyle}>{errors[ fieldKey ]}</div>;
  }
  else {
    jsx = null;
  }
  return jsx;
};

export default InputErrorMessage;