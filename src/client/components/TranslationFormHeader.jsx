// Copyright 2022, University of Colorado Boulder

/**
 * Create a header that displays info about a user's translation.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

/**
 * Display info about the sim/locale the user is translating.
 *
 * @param localeName
 * @param locale
 * @param simTitle
 * @returns {JSX.Element}
 */
const TranslationFormHeader = ( { localeName, locale, simTitle } ) => {
  return <h2>Translating {localeName} ({locale}) {simTitle}</h2>;
};

export default TranslationFormHeader;