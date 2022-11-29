// Copyright 2022, University of Colorado Boulder

import { useMemo, useState } from 'react';

/**
 * Taken from https://www.smashingmagazine.com/2020/03/sortable-tables-react/.
 *
 * @param items
 * @param config
 * @returns {{requestSort: requestSort, items: *[]}}
 */
const useSortableData = ( items, config = null ) => {
  const [ sortConfig, setSortConfig ] = useState( config );

  const sortedItems = useMemo( () => {
    const sortableItems = [ ...items ];
    if ( sortConfig !== null ) {
      sortableItems.sort( ( a, b ) => {
        if ( a[ sortConfig.key ] < b[ sortConfig.key ] ) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if ( a[ sortConfig.key ] > b[ sortConfig.key ] ) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      } );
    }
    return sortableItems;
  }, [ items, sortConfig ] );

  const requestSort = key => {
    let direction = 'ascending';
    if ( sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending' ) {
      direction = 'descending';
    }
    setSortConfig( { key: key, direction: direction } );
  };

  return { items: sortedItems, requestSort: requestSort };
};

export default useSortableData;