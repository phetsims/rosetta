# :construction: THIS README AND THE DOCUMENTATION ARE UNDER CONSTRUCTION :construction:

# Rosetta

Rosetta is PhET's translation utility for its HTML5 simulations. This repository contains the code for Rosetta's
user interface and the server-side support needed for translating PhET HTML5 simulations.

Rosetta uses [Node.js](https://nodejs.org/en/), [Express.js](https://expressjs.com/), and the [doT.js templating engine](https://olado.github.io/doT/index.html).

![Rosetta Stone](./img/rosetta.jpg)

## Contents

* [Documentation]()
  * [Admin Guide]()
  * [Implementation Notes]()
  * [How to Change a String Key]()
* [Running Rosetta Locally With PostgreSQL]()
  * [Windows Setup]()
  * [macOS Setup]()
* [Running Rosetta Remotely With PhET's Servers]()
  * [Configuration]()
  * [Legacy Servers]()
  * [PhET Server]()

## Documentation

* Read the [Admin Guide]().
* Read the [Implementation Notes]().
* Read [How to Change a String Key]().

## Running Rosetta Locally With PostgreSQL

This guide was made by @muedli on 2020-05-15.

### Windows 10 (1909) + Git 2.26.2 + Node.js v12.16.3 + PostgreSQL 12.2

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

### macOS 10.15.4 + Git 2.24.2 + Node.js v14.2.0 + PostgreSQL 12.2

1. Get your GitHub account set up with phetsims.
2. You should have Git pre-installed.
3. Install Node.js. (I recommend using [Homebrew](https://brew.sh/).)
4. Install PostgreSQL. (Again, I recommend using [Homebrew](https://brew.sh/).)
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

## Running Rosetta Remotely With PhET's Servers

### Rosetta's Configuration on Legacy Servers and PhET Server

Rosetta lives in /data/share/phet/rosetta. It's designed to work as a stand-alone repository.
Thus, it shouldn't need any other repositories cloned as siblings.

The user to run Rosetta is "phet-admin". It requires the certain fields filled out in
phet-admin's HOME/.phet/build-local.json (see the assertions in rosetta.js). These fields
should be filled out, but they may need to modified or updated.

The Rosetta uses syslog to save output to the Winston log. You can view the logs by typing
`sudo journalctl -u rosetta`. To tail the logs type `sudo journalctl -f -u rosetta`.

### Legacy Servers ("Simian" and "Figaro") 

* Start: `sudo /etc/init.d/rosetta start`
* Stop: `sudo /etc/init.d/rosetta stop`
* Check if Rosetta is running (note the lack of sudo): `/etc/init.d/rosetta status`

### PhET-Server

* Start: `sudo systemctl start rosetta`
* Stop: `sudo systemctl stop rosetta`
* Restart: `sudo systemctl restart rosetta`
* Check status (method 1): `sudo systemctl status rosetta`
* Check status (method 2): `sudo journalctl -u rosetta`
