// Copyright 2022, University of Colorado Boulder

/**
 * Create a header that displays info about a user's translation.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import React, { ReactElement } from 'react';

type HeaderProps = {
  localeName: string;
  locale: string;
  simTitle: string;
};

/**
 * Display info about the sim/locale the user is translating.
 */
const TranslationFormHeader = (
  { localeName, locale, simTitle }: HeaderProps ): ReactElement => {
  return <h2>Translating {localeName} ({locale}) {simTitle}</h2>;
};

export default TranslationFormHeader;