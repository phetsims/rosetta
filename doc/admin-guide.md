Administration Guide
====================

Contents
--------

- [Overview](#overview)
- [Old Rosetta](#old-rosetta)
- [Configuration](#configuration)
- [Triggering a Rebuild Without Being Credited](#triggering-a-rebuild-without-being-credited)
- [Take Offline for Maintenance](#take-offline-for-maintenance)
- [Update](#update)
- [Manage systemd Service](#manage-systemd-service)
- [View Logs](#view-logs)
- [Interact with the Short-Term String Storage Database](#interact-with-the-short-term-string-storage-database)
- [Test](#test)
- [Update Translation Stats](#update-translation-stats)
- [First-Time Production Setup](#first-time-production-setup)
  - [Clone Rosetta](#clone-rosetta)
  - [Create the systemd Service File](#create-the-systemd-service-file)
  - [Start Rosetta](#start-rosetta)

Overview
--------

Rosetta, also known as the translation utility, is an app that runs on phet-server2. As of this writing, the code on
phet-server2 is kept in the directory `/data/share/phet/translation-utility/rosetta`, and Git is used to pull updates.
When an update is pulled, the `rosetta` process needs to be restarted before the change will take effect (see below).

The process is run under the phet-admin account on phet-server2.

The utility is accessed at the URL https://phet.colorado.edu/translate.

Old Rosetta
-----------

Old Rosetta, or Rosetta 1, lives on a branch in this repository. We keep it around in case we ever need to revert to it.
The issue for this branch is: https://github.com/phetsims/rosetta/issues/365.

Configuration
-------------

There are a number of configuration parameters that are used by Rosetta, and these are generally stored in
the `~/.phet/rosetta-config.json` file for the account under which the process is being run. To best understand what
this file contains, take a look at the instances of the file on phet-server2 and phet-server-dev.

The login info URLs are:

- phet-server2 current: https://phet-direct.colorado.edu/user/check-login,
- phet-server2 past: https://phet.colorado.edu/services/check-login,
- phet-server-dev current: https://phet-direct-dev.colorado.edu/user/check-login,
- localhost current: http://localhost:16372/services/check-login,

There are some configuration values needed right away by the client-side code. We extract these values and write them to
the `publicConfig.js` file when Rosetta is started. For more info on this, see the README in the
`src/common` directory.

Logging Out
-----------

To log a user out, you need to hit a specific API endpoint. The URLs are:

- phet-server2 current: https://phet-direct.colorado.edu/logout
- phet-server-dev current: https://phet-direct-dev.colorado.edu/logout
  - Verify this with @mattpen.
- localhost current: http://localhost:16372/services/logout

You need to send credentials in order for the logout to work.

Triggering a Rebuild Without Being Credited
-------------------------------------------

### Background/Context

There have been times when a need has arisen to build (or rebuild) a simulation for a non-English locale. While one
might be tempted to do this via the normal translation interface by making and submitting a small change and then
reverting it and submitting again, this will unfortunately cause the submitter to be listed on the website as one of the
credited translators for that simulation. Issue https://github.com/phetsims/perennial/issues/178 describes a scenario
where the need to trigger builds without being credited arose. To fill this need, a route was added through which a PhET
team member can trigger a build of a simulation for a given locale. There are three parameters for this route: the sim
name, the locale, and the user ID that should be credited. The user ID can be obtained by looking in babel for the user
ID of the most recent translator.

### Instructions

1. If you need to change a translation, edit the Babel file for the translation as needed. Commit directly to main.
2. Make sure the instance of Rosetta that you plan to use has the build request flag set to true its config file. If
   you're using the public version, this will generally be set to true.
3. Obtain the user ID you wish to use from Babel.
4. Go to Rosetta's admin page, scroll down to the trigger build form, and enter the sim name, locale, and user ID. When
   you're ready, click the "Rebuild" button. (You can also hit the API route directly. This is useful if you want to
   trigger a build from a script.)
5. Check Rosetta's logs and the build server's logs as desired. These log files are located on phet-server/ox-dev and
   will require SSH to view.
6. Make sure your build went through successfully and the translation is published to the website. (This should take
   about five minutes.)

_Alternatively..._

When triggering rebuilds in the manner just described, the Rosetta client initiates the build by hitting the Rosetta
server's API with a particular request. In some cases, such as when creating a script to do multiple rebuilds, it may be
desirable to use this API directly. This is fairly advanced, so it isn't generally recommended unless you know what
you're doing. The URL for this is `/translate/api/triggerBuild/{{simName}}/{{locale}}/{{userId}}`.

Take Offline for Maintenance
----------------------------

Sometimes it's necessary to take Rosetta offline so the updates can be made or so that behind-the-scenes updates to
translation files can be made. There is a feature for this, and it will cause users to see a page that says something
like "The PhET translation utility is down for maintenance, please try again later." To put Rosetta into this mode:

1. Make sure that no one is actively using it by looking at the log by following the steps below.
2. Edit the configuration file `~/.phet/rosetta-config.json` to have the key-value pair `"IS_ENABLED": false`.
3. Restart Rosetta using the commands described below.

Set the value of enabled back to true and perform another restart to set Rosetta back to normal operation.

Update
------

Before trying to update Rosetta, you need to check its logs (see below), ensure no one is using it, and then stop its
systemd service (see below). Then, you should be able to simply `sudo -u phet-admin grunt update-rosetta`.

Manage systemd Service
----------------------

- Restart: `sudo systemctl restart rosetta`
- Start: `sudo systemctl start rosetta`
- Stop: `sudo systemctl stop rosetta`
- Status: `sudo systemctl status rosetta`

View Logs
---------

- Tail Rosetta's logs: `sudo journalctl -f -u rosetta`
- See
  also [this tutorial on `journalctl`](https://www.digitalocean.com/community/tutorials/how-to-use-journalctl-to-view-and-manipulate-systemd-logs).

Interact with the Short-Term String Storage Database
----------------------------------------------------

Rosetta allows translators to store strings temporarily without fully submitting them.  This is useful when a translator
has done some work on a translation, but hasn't fully completed the work and isn't ready to publish the translated sim.
In this case, the strings are stored in a database on phet-server2. The database a MongoDB database, it runs on
phet-server2, and it is called `rosetta`.  Below are a list of steps for accessing this DB and potentially changing it.

- Log in to phet-server2
- Switch to phet-admin
- Enter the MongoDB shell by typing `mongosh`
- Select the Rosetta DB by typing `use rosetta`
- Search for whatever record you want with a command like this: `db.shortTermTranslationStorage.findOne( { simName: 'faradays-electromagnetic-lab', userId: 1234 } )`
- Some other examples:
  - `db.shortTermTranslationStorage.findOne( { simName: 'build-an-atom'} )`
  - `db.shortTermTranslationStorage.findOne()`
  - `db.shortTermTranslationStorage.findOne( { locale: 'es' } )`
- A record can be deleted with `findOneAndDelete`

Test
----

Since Rosetta can be used at any time, we generally try to avoid taking it down for testing. It is set up to also run on
phet-server-dev. The directory structure is the same as that used on phet-server2.

The URL to access the version running on phet-server-dev is
https://ox-dev.colorado.edu/translate.

On phet-server-dev, the configuration file is generally set up so that the value of the `BABEL_BRANCH` key is set to
tests. This allows translations to be committed to a different branch of the phetsims/babel repository (where the
translated string files live) so that they don't affect "real" translations. The downside of this is that there aren't
many real translations on this branch, so it is sometimes necessary to manually move some over from the main branch for
more realistic testing.

Update Translation Stats
------------------------

If you need to update the translation stats for a locale/sim, you can go to the admin page and input your sim and locale
in the "Flush Report Object" section, then click the "Flush" button, and it should remove the old, cached stats. The
next time someone views the translation report for that sim/locale, the stats should be updated.

First-Time Production Setup
---------------------------

### Clone Rosetta

- Go to the directory where you want Rosetta.
- Clone Rosetta.
- Run `npm install` in Rosetta's root directory.
- Run `./bin/bootstrap.sh` to install Rosetta's initial dependencies.

### Create the systemd Service File

- There should be a systemd service file for Rosetta.
- The service file should specify the working directory of the Rosetta service to be the directory containing
  the `start` script (or whatever directory contains the script that starts the production version of Rosetta). As of
  this writing, this is Rosetta's root directory.
- As of this writing, phet-server-dev and phet-server2 use Node Version Manager, a widely used Bash script, for managing
  different Node versions. Use `nvm` to check the version of Node you're using, make sure it's the version you want,
  then do the next step.
- This service file should specify the full path to the `npm` executable and use the executable to run the `start`
  script of Rosetta. That is, the `ExecStart`
  key in the service file should have a value like `/full/path/to/npm start`.

### Start Rosetta

See the above section on managing Rosetta's systemd service.
