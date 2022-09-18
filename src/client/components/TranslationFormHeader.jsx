// Copyright 2022, University of Colorado Boulder

/* eslint-disable react/prop-types */

const TranslationFormHeader = props => {
  return (
    <div>
      <h1>Translation Form</h1>
      <h2 className='text-muted'>Locale: {props.locale}</h2>
      <h2 className='text-muted'>Sim: {props.simName}</h2>
    </div>
  );
};

export default TranslationFormHeader;