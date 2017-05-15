# Rosetta
UI and server-side support for translating PhET HTML5 simulations

This code is based on Node.js, ExpressJS, and the doT templating engine.


### Starting and stopping rosetta on phet-server

To start:
```sudo systemctl start rosetta```

To stop:
```sudo systemctl stop rosetta```

To restart:
```sudo systemctl restart rosetta```

To check status:
```sudo systemctl status rosetta```
or
```sudo journalctl -u rosetta```

### Starting and stopping rosetta on simian and figaro (legacy servers)

To start:
```sudo /etc/init.d/rosetta start```

To stop:
```sudo /etc/init.d/rosetta stop```

To check if rosetta is running (note the lack of sudo):
```/etc/init.d/rosetta status```

### Rosetta configuration on simian, figaro, and phet-server.

All of the phet repos live on simian, figaro and phet-server under /data/share/phet/phet-repos. Rosetta lives in /data/share/phet/phet-repos/rosetta.

Rosetta is run as user "phet-admin". It requires the certain fields filled out in phet-admin's HOME/.phet/build-local.json
(see assertions in rosetta.js). These fields are already filled out, but they may need to modified or updated.

The Rosetta uses syslog to save output to the winston log.  You can view the logs by typing `sudo journalctl -u rosetta` or to tail the logs type `sudo journalctl -f -u rosetta`

### Database setup

Rosetta requires a postgres database setup for the saving strings functionality.

To setup the database locally:

1. Install postgres and ensure it is running.
2. Create a postgres database called "rosetta":

    `createdb rosetta`
3. Create a table in the rosetta database and add a sql function used in the rosetta code:

    `psql rosetta -f init.sql`
4. If default connection string does not work, you will need to add a different pgConnectionString in build-local.json (see https://github.com/brianc/node-postgres for more details)

To set up the database on the server:

The database is already configured on the server. See init.sql for the changes that have been made to the website database.
