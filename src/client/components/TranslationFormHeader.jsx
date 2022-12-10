// Copyright 2022, University of Colorado Boulder

const TranslationFormHeader = ( { localeName, locale, simTitle } ) => {
  return <h2>Translating {localeName} ({locale}) {simTitle}</h2>;
};

export default TranslationFormHeader;