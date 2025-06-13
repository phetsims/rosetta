// Copyright 2022, University of Colorado Boulder

/**
 * Export a sort key enum. These sort keys are arrays. The first item in the array is the
 * primary sort key, and the subsequent values are "fallback" sort keys. You can think of
 * them as "tie-breaker" sort keys.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { ReportObjectSortingKeys } from '../../common/ReportObject.js';

type SortingKeys = {
  [ key: string ]: ReportObjectSortingKeys[];
};

const SortKeyEnum: SortingKeys = {
  SIM_TITLE: [ 'simTitle' ],
  TOTAL_STRINGS: [ 'totalPercent', 'totalStrings' ]
};

Object.freeze( SortKeyEnum );

export default SortKeyEnum;