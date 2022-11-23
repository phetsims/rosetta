// Copyright 2022, University of Colorado Boulder

/**
 * Return an object used for rendering the translation report for a given locale.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getCategorizedStringKeys from '../getCategorizedStringKeys.js';
import getLatestSimSha from '../getLatestSimSha.js';
import getSimHtml from '../getSimHtml.js';
import getSimMetadata from '../getSimMetadata.js';
import getSimNamesAndTitles from '../getSimNamesAndTitles.js';
import getSimUrl from '../getSimUrl.js';
import getStringKeysWithRepoName from '../getStringKeysWithRepoName.js';
import getCommonEnglishStringKeysAndValues from './getCommonEnglishStringKeysAndValues.js';
import getCommonTranslatedStringKeysAndValues from './getCommonTranslatedStringKeysAndValues.js';
import getSimSpecificEnglishStringKeysAndValues from './getSimSpecificEnglishStringKeysAndValues.js';
import getSimSpecificTranslatedStringKeysAndValues from './getSimSpecificTranslatedStringKeysAndValues.js';
import getTranslatedAndUntranslatedSims from './getTranslatedAndUntranslatedSims.js';

const getTranslationReport = async locale => {
  console.time( 'getTranslationReport' );

  const translationReport = {};

  const simMetadata = await getSimMetadata();
  const simNames = Object.keys( getSimNamesAndTitles( simMetadata ) );
  const translatedAndUntranslatedSims = await getTranslatedAndUntranslatedSims( locale );

  // TODO: Take out counter when done.
  let counter = 0;
  for ( const sim of translatedAndUntranslatedSims.translated ) {

    if ( counter > 5 ) {
      return translationReport;
    }

    if ( translationReport[ sim ] === undefined ) {
      translationReport[ sim ] = {
        numCommonStrings: null,
        numCommonTranslatedStrings: null,
        numSimSpecificStrings: null,
        numSimSpecificTranslatedStrings: null
      };
    }

    const simUrl = getSimUrl( sim );
    const simHtml = await getSimHtml( simUrl );
    const stringKeysWithRepoName = Object.keys( getStringKeysWithRepoName( simHtml ) );
    const categorizedStringKeys = await getCategorizedStringKeys( sim, simNames, stringKeysWithRepoName );

    const commonEnglishStringKeysAndValues = await getCommonEnglishStringKeysAndValues(
      sim,
      simNames,
      categorizedStringKeys,
      stringKeysWithRepoName
    );
    translationReport[ sim ].numCommonStrings = Object
      .values( commonEnglishStringKeysAndValues )
      .filter( value => value !== 'no longer used' ).length;

    const commonTranslatedStringKeysAndValues = await getCommonTranslatedStringKeysAndValues(
      sim,
      locale,
      simNames,
      stringKeysWithRepoName,
      categorizedStringKeys
    );
    translationReport[ sim ].numCommonTranslatedStrings = Object
      .values( commonTranslatedStringKeysAndValues )
      .filter( value => value !== '' ).length;

    const latestSimSha = await getLatestSimSha( sim );
    const simSpecificEnglishStringKeysAndValues = await getSimSpecificEnglishStringKeysAndValues(
      sim,
      latestSimSha,
      categorizedStringKeys,
      stringKeysWithRepoName
    );
    translationReport[ sim ].numSimSpecificStrings = Object
      .values( simSpecificEnglishStringKeysAndValues )
      .filter( value => value !== 'no longer used' ).length;

    const simSpecificTranslatedStringKeysAndValues = await getSimSpecificTranslatedStringKeysAndValues(
      sim,
      locale,
      categorizedStringKeys
    );
    translationReport[ sim ].numSimSpecificTranslatedStrings = Object
      .values( simSpecificTranslatedStringKeysAndValues )
      .filter( value => value !== '' ).length;

    counter++;
  }

  console.timeEnd( 'getTranslationReport' );
  return translationReport;
};

( async () => {
  const translationReport = await getTranslationReport( 'ab' );
  console.log( JSON.stringify( translationReport, null, 4 ) );
} )();

export default getTranslationReport;