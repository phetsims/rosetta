// Copyright 2022, University of Colorado Boulder

const getTranslationReportData = ( simNamesAndTitles, reportObjects, locale ) => {

  const translationReportData = {
    locale: locale
  };

  // Initially, set all data to null.
  for ( const simName of Object.keys( simNamesAndTitles ) ) {
    translationReportData[ simName ] = {
      simTitle: simNamesAndTitles[ simName ],
      simSpecificPercentage: null,
      commonPercentage: null
    };
  }

  // Overwrite rows for which we have data.
  for ( const reportObject of reportObjects ) {
    const simSpecificPercent = Math.floor( ( reportObject.numSimSpecificTranslatedStrings / reportObject.numSimSpecificStrings ) * 100 );
    const commonPercent = Math.floor( ( reportObject.numCommonTranslatedStrings / reportObject.numCommonStrings ) * 100 );
    if ( Object.keys( translationReportData ).includes( reportObject.simName ) ) {
      translationReportData[ reportObject.simName ].simSpecificPercentage = simSpecificPercent;
      translationReportData[ reportObject.simName ].commonPercentage = commonPercent;
    }
  }

  return translationReportData;
};

export default getTranslationReportData;