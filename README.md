# Rosetta

Rosetta is PhET's translation utility for its HTML5 simulations. This repository contains the code for Rosetta's
user interface and the server-side support needed for translating PhET HTML5 simulations.

Rosetta uses [Node.js](https://nodejs.org/en/), [Express.js](https://expressjs.com/), and the [doT.js templating engine](https://olado.github.io/doT/index.html).

## Running Rosetta

### Starting and Stopping Rosetta on PhET-Server

Start:
```sudo systemctl start rosetta```

Stop:
```sudo systemctl stop rosetta```

Restart:
```sudo systemctl restart rosetta```

Check status (method 1):
```sudo systemctl status rosetta```

Check status (method 2):
```sudo journalctl -u rosetta```

### Starting and Stopping Rosetta on Simian and Figaro (Legacy Servers)

Start:
```sudo /etc/init.d/rosetta start```

Stop:
```sudo /etc/init.d/rosetta stop```

Check if Rosetta is running (note the lack of sudo):
```/etc/init.d/rosetta status```

### Rosetta Configuration on Simian, Figaro, and PhET-Server

Rosetta lives in /data/share/phet/rosetta. It is designed to work as a stand alone repo, and shouldn't
need any other repos cloned as siblings.

Rosetta is run as user "phet-admin". It requires the certain fields filled out in phet-admin's HOME/.phet/build-local.json
(see assertions in rosetta.js). These fields are already filled out, but they may need to modified or updated.

The Rosetta uses syslog to save output to the winston log. You can view the logs by typing `sudo journalctl -u rosetta` or
to tail the logs type `sudo journalctl -f -u rosetta`.

Running Rosetta Locally With PostgreSQL
=======================================

This guide was made by @muedli on 2020-05-15.

Windows 10 (1909) + Git 2.26.2 + Node.js v12.16.3 + PostgreSQL 12.2
-------------------------------------------------------------------
1. Get your GitHub account set up with phetsims.
2. Install and set up Git. Default installation options should be fine.
  (I used [Chocolatey](https://chocolatey.org/).)
3. Install Node.js. Default installation options should be fine.
  (Again, I used [Chocolatey](https://chocolatey.org/).)
4. Install PostgreSQL. Defualt installation options should be fine. Make sure
  you have the password that you set or was set for you during installation.
  (Again, I used [Chocolatey](https://chocolatey.org/).)
5. Clone the phetsims/rosetta repository.
6. In the rosetta directory on your machine, run `npm install`.
7. Open the SQL shell. (In my case, an SQL shell was installed when I installed PostgreSQL.)
8. Make a database for Rosetta by running `CREATE DATABASE rosetta;`.
9. Switch to the rosetta database.
10. Run the rosetta/dev/init.sql script with `\i '{path-to-your-copy-of-rosetta}/rosetta/dev/init.sql';` .
    (Note how the file path is in single quotes and the slashes are forward slashes, not
    backward slashes.
11. In the correct directory (`C:\Users\{username}\` on Windows), `mkdir .phet/`.
12. In `.phet/`, make `rosetta-config.json` with the following:
```
{
  "githubUsername": "phet-dev",
  "githubPassword": "{phet-dev-password-here}",
  "buildServerAuthorizationCode": "{code-here}",
  "serverToken": "{token-here}",
  "productionServerURL": "https://ox-dev.colorado.edu",
  "enabled": true,
  "rosettaSessionSecret": "{any-string-for-testing}",
  "stringStorageDbHost": "localhost",
  "stringStorageDbPort": "5432",
  "stringStorageDbName": "rosetta",
  "stringStorageDbUser": "{user-here}",
  "stringStorageDbPass": "{your-postgres-password-here}",
  "loggingLevel": "debug",
  "babelBranch": "tests",
  "performStringCommits": false,
  "sendBuildRequests": false
}
```
13. In the rosetta directory, run `npm run dev`.
14. Open your browser to the port specified by `LISTEN_PORT` in rosetta.js, which, as of
    this writing, is 16372. (http://localhost:16372.)

macOS 10.15.4 + Git 2.24.2 + Node.js v14.2.0 + PostgreSQL 12.2
--------------------------------------------------------------
1. Get your GitHub account set up with phetsims.
2. You should have Git pre-installed.
3. Install Node.js. (I reccommend using [Homebrew](https://brew.sh/).)
4. Install PostgreSQL. (Again, I reccommend using [Homebrew](https://brew.sh/).)
5. Clone the phetsims/rosetta repository.
6. In the rosetta directory on your machine, run `npm install`.
7. Start your server using `pg_ctl -D /usr/local/var/postgres start`.
8. To enter the SQL shell, run `psql {username-for-database}`.
9. Create the rosetta database, `createdb rosetta`.
10. Connect to the database by running `\connect rosetta`.
11. Run the rosetta/dev/init.sql script with `\i {path-to-your-copy-of-rosetta}/rosetta/dev/init.sql;` .
  (I don't think macOS needs the single quotes that are necessary on Windows.)
12. In the correct directory (`/Users/{username}/` on macOS), `mkdir .phet/`.
13. In `.phet/`, make rosetta-config.json with the following:
```
{
  "githubUsername": "phet-dev",
  "githubPassword": "{phet-dev-password-here}",
  "buildServerAuthorizationCode": "{code-here}",
  "serverToken": "{token-here}",
  "productionServerURL": "https://ox-dev.colorado.edu",
  "enabled": true,
  "rosettaSessionSecret": "{any-string-for-testing}",
  "stringStorageDbHost": "localhost",
  "stringStorageDbPort": "5432",
  "stringStorageDbName": "rosetta",
  "stringStorageDbUser": "{user-here}",
  "stringStorageDbPass": "{your-postgres-password-here}",
  "loggingLevel": "debug",
  "babelBranch": "tests",
  "performStringCommits": false,
  "sendBuildRequests": false
}
```
14. Make sure your database username and password are correct in the config. In my
  case, the username was "liam" (my computer username) and I didn't set a password,
  so I just put "dummyString."
15. In the rosetta directory, run `npm run dev`.
16. Open your browser to the port specified by `LISTEN_PORT` in rosetta.js, which, as of
  this writing, is 16372. (http://localhost:16372.)

### Local Development Setup (In Progress)

Rosetta requires a PostgreSQL database setup to save strings that a translator is working on.

To setup the database locally:

1. Install PostgreSQL and ensure it is running.
2. Create a postgres database called "rosetta":
    `createdb rosetta`.
3. Create a table in the rosetta database and add an SQL function used in the rosetta code:
    `psql rosetta -f init.sql`.
4. If default connection string does not work, you will need to add a different pgConnectionString in build-local.json.
(See https://github.com/brianc/node-postgres for more details.)

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

Another option is to use [Docker](https://docs.docker.com/). Follow the
[installation instructions](https://docs.docker.com/install/) to get access to the `docker` command and execute the following:

`docker pull postgres`

If you have the latest version of the repo and this is your first time running the container, you can simply execute
`start_pg_docker.sh` script within the `dev` directory at the repo's root. The script will start the container with the following attributes:

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
}
```

All postgres specific attributes (`username`, `password`, `database name`) are set within the `pg.env` environment file.
Feel free to update them in `pg.env`, but be sure to also update them in `build-local.json`.

To stop the container, run `docker stop rosettadb`. After stopping, the container is still built and can be restarted with
the command `docker restart rosettadb`. The data is persisted in `/docker/data`.

To set up the database on the server:

The database is already configured on the server. See init.sql for the changes that have been made to the website database.
