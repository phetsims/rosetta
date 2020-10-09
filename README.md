# Rosetta

Rosetta is PhET's translation utility for its HTML5 simulations. This repository contains the code for Rosetta's
user interface and the server-side support needed for translating PhET HTML5 simulations.

Rosetta uses [Node.js](https://nodejs.org/en/), [Express.js](https://expressjs.com/), and the [doT.js templating engine](https://olado.github.io/doT/index.html).

![Rosetta Stone](./img/rosetta.jpg)

## Contents

* [Getting Started](https://github.com/phetsims/rosetta#getting-started)
  * [Running Rosetta Locally With PostgreSQL](https://github.com/phetsims/rosetta#running-rosetta-locally-with-postgresql)
  * [Running Rosetta Remotely With PhET's Servers](https://github.com/phetsims/rosetta#running-rosetta-remotely-with-phets-servers)
    * [Configuration](https://github.com/phetsims/rosetta#rosettas-configuration-on-legacy-servers-and-phet-server)
    * [Legacy Servers](https://github.com/phetsims/rosetta#legacy-servers-simian-and-figaro)
    * [PhET Server](https://github.com/phetsims/rosetta#phet-server)
* [Documentation](https://github.com/phetsims/rosetta#documentation)
  * [Code Style](https://github.com/phetsims/rosetta#code-style)
  * [Admin Guide](https://github.com/phetsims/rosetta/blob/master/doc/admin-guide.md)
  * [Implementation Notes](https://github.com/phetsims/rosetta/blob/master/doc/implementation-notes.md)
  * [How to Change a String Key](https://github.com/phetsims/rosetta/blob/master/doc/how-to-change-a-string-key.md)

## Getting Started

### Running Rosetta Locally With PostgreSQL

This guide was made by @muedli on 2020-05-15.

<details>
<summary><b>Windows 10 (1909) + Git 2.26.2 + Node.js v12.16.3 + PostgreSQL 12.2</b></summary>

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
11. I (@muedli) ran into an issue when trying to put Chinese characters in a test translation. If you try to
    `SELECT * FROM saved_translations;` without having `SET client_encoding TO 'UTF8';`, you'll get an error along the
    lines of
    `character with byte sequence 0xe5 0x8a 0x9b in encoding "UTF8" has no equivalent in encoding "WIN1252"`. Thus,
    you should `SET client_encoding TO 'UTF8';`. Unfortunately, you still can't view the characters in the SQL shell.
    (There might be a solution to this, but I haven't figured it out yet.) See
    [this Stack Overflow question](https://stackoverflow.com/questions/38481829/postgresql-character-with-byte-sequence-0xc2-0x81-in-encoding-utf8-has-no-equ)
    for more information.
12. In the correct directory (`C:\Users\{username}\` on Windows), `mkdir .phet/`.
13. In `.phet/`, make `rosetta-config.json` with the following:
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
14. In the rosetta directory, run `npm run dev`. (For some reason, as of this writing, Git Bash doesn't let you kill the 
    process with ctrl + c. Thus, I've been using `taskkill /F /IM node.exe` in cmd. There's probably
    a more graceful way to do this.)
15. Open your browser to the port specified by `LISTEN_PORT` in rosetta.js, which, as of
    this writing, is 16372. (http://localhost:16372.)
    
</details>

<details>
<summary><b>macOS 10.15.4 + Git 2.24.2 + Node.js v14.2.0 + PostgreSQL 12.2</b></summary>

1. Get your GitHub account set up with phetsims.
2. You should have Git pre-installed.
3. Install Node.js. (I recommend using [Homebrew](https://brew.sh/).)
4. Install PostgreSQL. (Again, I recommend using [Homebrew](https://brew.sh/).)
5. Clone the phetsims/rosetta repository.
6. In the rosetta directory on your machine, run `npm install`.
7. Start your server using `pg_ctl -D /usr/local/var/postgres start`.
8. To enter the SQL shell, run `psql {username-for-database}`.
9. Create the rosetta database, `create database rosetta;`.
10. Connect to the database by running `\connect rosetta;`.
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
    case, the username was "liam" (my computer username). As of this writing the default
    behavior is to use the computer username and not to set a password. You'll need to set
    a password because there is code asserting that a password exists. To create a password,
    type `ALTER USER your-username WITH PASSWORD 'password';`.
15. In the rosetta directory, run `npm run dev`.
16. Open your browser to the port specified by `LISTEN_PORT` in rosetta.js, which, as of
    this writing, is 16372. (http://localhost:16372.)
    
</details>

### Running Rosetta Remotely With PhET's Servers

#### Rosetta's Configuration on Legacy Servers and PhET Server

Rosetta lives in /data/share/phet/rosetta. It's designed to work as a stand-alone repository.
Thus, it shouldn't need any other repositories cloned as siblings.

The user to run Rosetta is "phet-admin". It requires the certain fields filled out in
phet-admin's HOME/.phet/build-local.json (see the assertions in rosetta.js). These fields
should be filled out, but they may need to modified or updated.

The Rosetta uses syslog to save output to the Winston log. You can view the logs by typing
`sudo journalctl -u rosetta`. To tail the logs type `sudo journalctl -f -u rosetta`.

#### Legacy Servers ("Simian" and "Figaro") 

* Start: `sudo /etc/init.d/rosetta start`
* Stop: `sudo /etc/init.d/rosetta stop`
* Check if Rosetta is running (note the lack of sudo): `/etc/init.d/rosetta status`

#### PhET Server

* Start: `sudo systemctl start rosetta`
* Stop: `sudo systemctl stop rosetta`
* Restart: `sudo systemctl restart rosetta`
* Check status (method 1): `sudo systemctl status rosetta`
* Check status (method 2): `sudo journalctl -u rosetta`

## Documentation

### Code Style

1. If you're using the JetBrains IntelliJ IDEA IDE, you should use the
`phetsims/phet-info/ide/idea/phet-idea-codestyle.xml` file. [This page](https://www.jetbrains.com/help/idea/configuring-code-style.html)
has info on how to set up the PhET code style with IntelliJ.
2. We like to follow the conventions outlined in [Idomatic.js](https://github.com/rwaldron/idiomatic.js/).
3. We also have our own [coding conventions](https://github.com/phetsims/phet-info/blob/master/checklists/code_review_checklist.md#coding-conventions).
4. Each file should have a copyright and a JSDoc-style file description with the author(s) at the top:
```
// Copyright 20xx-20yy, University of Colorado Boulder

/**
 * Try to explain what the file does succinctly without using too much jargon. The description should consist of
 * complete sentences with proper punctuation. There should be a blank line after the description.
 * 
 * @author Firstname Lastname (PhET Interactive Simulations)
 */
```
5. We like to `'use strict';`.
6. List your `// modules` and `// order-dependent modules`.
7. List your (symbolic) `// constants`. These constants should never change. They are things like numbers and strings.
They should be `C_STYLE_CONSTANT_CASE`.
  * It is possible to have constants in the global scope that are regular `camelCase`. An
  example can be found in `js/simData.js`. It is a variable that needs to be populated. It's never reassigned.
  ```
  // Populated by obtaining metadata from the PhET website. Used as a cache. Updated when needed.
  const simInfoObject = {};
  ```
8. For each function in the file, there needs to be a JSDoc-style description above it:
```
/**
 * Describe the function using a verb at the beginning of the sentence. This should be a complete sentence. There
 * should be a blank line after the description.
 *
 * @param {type} param1Name - concise parameter description <-- prefer sentence fragments, but this can be a complete sentence with proper capitalization
 * @param {type} param2Name - concise parameter description
 * @returns {type} returnVariableName - concise return variable description
 */
```
9. Regular comments in the code should be complete sentences that describe code that isn't sufficiently self-describing
or complete sentences that explain why the code is the way it is. Not having a comment is preferable to having a
cryptic or potentially stale comment.
10. All TODO comments need to have a link to an issue.
11. Log messages should have proper capitalization, but there shouldn't be a period at the end of log messages because
log messages and error messages sometimes insert a period.
12. Function names and variable names shouldn't have quotes around them in comments or log messages.
13. If you ever run into a situation where you're wondering what to name a variable that has a common acronym in it,
just use regular `camelCase`. For example, prefer `myJsonObject` to `myJSONObject`. Also, prefer `myUserId` to
`myUserID`. It's kind of ugly this way, but it's a bit easier to read.

* Read the [Admin Guide](https://github.com/phetsims/rosetta/blob/master/doc/admin-guide.md).
* Read the [Implementation Notes](https://github.com/phetsims/rosetta/blob/master/doc/implementation-notes.md).
* Read [How to Change a String Key](https://github.com/phetsims/rosetta/blob/master/doc/how-to-change-a-string-key.md).
