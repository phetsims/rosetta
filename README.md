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

Rosetta lives in /data/share/phet/rosetta. It is designed to work as a stand alone repo, and shouldn't
need any other repos cloned as siblings

Rosetta is run as user "phet-admin". It requires the certain fields filled out in phet-admin's HOME/.phet/build-local.json
(see assertions in rosetta.js). These fields are already filled out, but they may need to modified or updated.

The Rosetta uses syslog to save output to the winston log.  You can view the logs by typing `sudo journalctl -u rosetta` or to tail the logs type `sudo journalctl -f -u rosetta`

### Local Development Setup (in progress)

Rosetta requires a postgres database setup for the saving strings functionality.

To setup the database locally:

1. Install postgres and ensure it is running.
2. Create a postgres database called "rosetta":

    `createdb rosetta`
3. Create a table in the rosetta database and add a sql function used in the rosetta code:

    `psql rosetta -f init.sql`
4. If default connection string does not work, you will need to add a different pgConnectionString in build-local.json (see https://github.com/brianc/node-postgres for more details)

The `pg` module uses environment variables to establish it's connection parameters. The defaults are:
```
PGHOST='localhost'
PGUSER=process.env.USER
PGDATABASE=process.env.USER
PGPASSWORD=null
PGPORT=5432
```

If those don't work for your setup, you can set them in your `build-local.json` using the keys referenced in the next section.

#### Docker

Another option is to use [Docker](https://docs.docker.com/). Follow the [installation instructions](https://docs.docker.com/install/) to get access to the `docker` command and execute the following:

`docker pull postgres`

If you have the latest version of the repo and this is your first time running the container, you can simply execute `start_pg_docker.sh` script within the `docker` directory at the repo's root. The script will start the container with the following attributes:
- container name: `rosettadb`
- db network address: `0.0.0.0:5432` or `localhost:5432`
- db username: `phet`
- db password: `phet`
- db name: `rosetta`

Rosetta pulls the development connection parameters from your `build-local.json`, so the following will need to be added there:
```
{
  "rosettaDevDbUser": "phet",
  "rosettaDevDbPass": "phetpass",
  "rosettaDevDbHost": "0.0.0.0",
  "rosettaDevDbPort": "5432",
  "rosettaDevDbName": "rosetta"
}```
All postgres specific attributes (`username`, `password`, `database name`) are set within the `pg.env` environment file. Feel free to update them in `pg.env`, but be sure to also update them in `build-local.json`.

To stop the container, run `docker stop rosettadb`. After stopping, the container is still built and can be restarted with the command `docker restart rosettadb`. The data is persisted in `/docker/data`.

To set up the database on the server:

The database is already configured on the server. See init.sql for the changes that have been made to the website database.
