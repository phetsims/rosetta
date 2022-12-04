// Copyright 2022, University of Colorado Boulder

/* eslint-disable indent */

const NotYetTranslatedSimsTable = ( { locale, localeName } ) => {

  const notYetTranslatedSims = [ 'foo-sim', 'bar-sim', 'baz-sim' ];
  const notYetTranslatedRows = notYetTranslatedSims.map( sim => {
    return (
      <tr key={sim}>
        <td>{sim} in {locale}</td>
      </tr>
    );
  } );

  return (
    <div>
      <h3>Sims not yet translated into {localeName}</h3>
      <table className='table table-striped'>
        <thead>
        <tr>
          <th>Sim Title</th>
        </tr>
        </thead>
        <tbody>{notYetTranslatedRows}</tbody>
      </table>
    </div>
  );
};

export default NotYetTranslatedSimsTable;