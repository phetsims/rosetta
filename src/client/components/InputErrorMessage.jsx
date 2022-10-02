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
  // TODO: It seems like the state for the errors object isn't reaching this component?
  // TODO: Because of https://stackoverflow.com/questions/41233458/react-child-component-not-updating-after-parent-state-change?
  // TODO: Would something like this https://stackoverflow.com/a/41679634 help?
  // TODO: Using something like {...props} on parent components?
  // TODO: And https://formik.org/docs/api/useField?
  if ( errors[ fieldKey ] && touched[ fieldKey ] ) {
    jsx = <div style={divStyle}>{errors[ fieldKey ]}</div>;
  }
  else {
    jsx = null;
  }
  return jsx;
};

export default InputErrorMessage;