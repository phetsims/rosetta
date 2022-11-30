// Copyright 2022, University of Colorado Boulder

import { useEffect, useMemo, useState } from 'react';
import arrowUpDown from '../img/arrow-down-up.svg';

const ASCENDING_FLAG = 'ascending';
const DESCENDING_FLAG = 'descending';

const SortButton = props => {
  const [ sortDirections, setSortDirections ] = useState( {
    simTitle: null,
    simSpecificPercent: null,
    commonPercent: null
  } );
  const sortableReportObjects = props.reportObjects;
  const sortedReportObjects = useMemo( () => {
    if ( props.reportPopulated ) {
      sortableReportObjects.sort( ( a, b ) => {
        if ( a[ props.columnName ] < b[ props.columnName ] ) {
          return sortDirections[ props.columnName ] === ASCENDING_FLAG ? -1 : 1;
        }
        if ( a[ props.columnName ] > b[ props.columnName ] ) {
          return sortDirections[ props.columnName ] === ASCENDING_FLAG ? 1 : -1;
        }
        return 0;
      } );
    }
    return sortableReportObjects;
  }, [ props.columnName, sortDirections, sortableReportObjects ] );

  useEffect( () => {
    if ( props.reportPopulated ) {
      props.setReportObjects( sortedReportObjects );
    }
  }, [ sortedReportObjects ] );

  const handleClick = () => {
    if ( props.reportPopulated ) {

      // Set the direction of sorting.
      if ( sortDirections[ props.columnName ] === null ) {
        const newSortDirections = sortDirections;
        newSortDirections[ props.columnName ] = ASCENDING_FLAG;
        setSortDirections( newSortDirections );
      }
      else if ( sortDirections[ props.columnName ] === ASCENDING_FLAG ) {
        const newSortDirections = sortDirections;
        newSortDirections[ props.columnName ] = DESCENDING_FLAG;
        setSortDirections( newSortDirections );
      }
      else if ( sortDirections[ props.columnName ] === DESCENDING_FLAG ) {
        const newSortDirections = sortDirections;
        newSortDirections[ props.columnName ] = ASCENDING_FLAG;
        setSortDirections( newSortDirections );
      }
    }
    else {
      window.alert( 'Please wait until the report is populated before sorting a column.' );
    }
  };
  return (
    <button className='btn btn-light' onClick={handleClick}>
      <img src={arrowUpDown} alt='up down arrow icon'/>
    </button>
  );
};

export default SortButton;