// Copyright 2022, University of Colorado Boulder

/**
 * The testTranslationInA11yView function provides the functionality for the "test translation" API route, which allows a
 * translator to view and interact with the simulation with their translated values before submitting them.  The
 * function works by retrieving the sim's currently published HTML file, replacing the strings therein with those
 * entered by the translator, and sending this modified HTML to the client.
 *
 * @param req - Express request object, contains the sim name and translation info.
 * @param res - Express response object
 *
 * @author Agustín Vallejo
 */

import { Request, Response } from 'express';
import { ClientSubmittedTranslationData } from '../../../common/ClientSubmittedTranslationData.js';
import getReplacementStringObject from '../getReplacementStringObject.js';
import getSimA11yViewUrl from '../getSimA11yViewUrl.js';
import getSimHtml from '../getSimHtml.js';
import getSimUrl from '../getSimUrl.js';
import getStringKeysUsedInSim from '../getStringKeysUsedInSim.js';
import logger from '../logger.js';

const testTranslationInA11yView = async ( req: Request, res: Response ): Promise<void> => {
  const simName = req.body.simName;

  // response value
  let simHtmlWithTranslatedStrings: string;

  try {
    logger.info( `testing translation for sim: ${simName}` );

    // Get the set of keys and English values for the strings that are used in the sim.
    const stringKeysAndEnglishValues = await getStringKeysUsedInSim( simName );

    if ( Object.keys( stringKeysAndEnglishValues ).length > 0 ) {

      // Get an object with the string keys and any translated strings that the user has provided. If the user hasn't
      // provided a value for a given key the English value will be left unchanged.
      const stringKeysAndTestValues = await getReplacementStringObject(
        stringKeysAndEnglishValues,
        req.body as ClientSubmittedTranslationData
      );

      // Get the currently published HTML for the simulation that is being tested.
      const simHtml = await getSimHtml( getSimUrl( simName ) );
      const simA11yHtml = await getSimHtml( getSimA11yViewUrl( simName ) );

      // Replace the assignment statement in the sim code that defines the string values with the translated strings.
      const regex = /^\s*window\.phet\.chipper\.strings\s*=\s*.*$/m;
      const translatedSimHtml = simHtml.replace(
        regex,
        `window.phet.chipper.strings = {"en":${JSON.stringify( stringKeysAndTestValues )}};`
      );

      // Generate a URI for the translated sim HTML, so that it can be used in the iframe.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const translatedSimURI = `data:text/html;charset=utf-8,${encodeURIComponent( translatedSimHtml )}`;

      // This regex targets (var|let|const) simURL = anything;
      const regexSimUrlDeclaration = /simURL\s*=\s*['"]?.*?['"]?\s*;/;

      // patch the wrapper so it writes directly into the iframe ---------
      // And force replace the filenameEnding with filenameEnding = '.html'
      simHtmlWithTranslatedStrings = simA11yHtml
        .replace(
          regexSimUrlDeclaration,
          `simURL = "${getSimUrl( simName )}";`
          // `simURL = "translatedSimURI";` ideally this would work, but it shows as about:blank#blocked in the iframe
        );

      logger.info( 'responding with sim HTML for translation test' );
    }
    else {

      // No string map info found, return an error message that will be displayed to the user.
      simHtmlWithTranslatedStrings = `Error: unable to get string map file sim: ${simName}`;
      logger.error( 'no string map info found' );
    }
  }
  catch( e ) {
    simHtmlWithTranslatedStrings = `Error testing translation for ${simName}: ${e}`;
    logger.error( e );
  }

  res.send( simHtmlWithTranslatedStrings );
};

export default testTranslationInA11yView;