Administration Guide for the PhET Translation Utility
=====================================================

Background
----------

Rosetta, also known as the translation utility, is a Node.js-based server app that runs on phet-server2. As of this
writing, the code on phet-server2 is kept in the directory /data/share/phet/rosetta, and Git is used to pull updates.  
When an update is pulled, the rosetta process needs to be restarted before the change will take effect (see below).

The process is run under the phet-admin account on phet-server2.

The utility is accessed at the URL https://phet.colorado.edu/translate.

Starting, Stopping, and Checking
--------------------------------

You must have sudo privileges to execute the following commands.

Restart:
`sudo systemctl stop rosetta`
`grunt update-rosetta`
`sudo systemctl start rosetta`

**NOTE: It is very important to run the `grunt update-rosetta` task before starting again because the `update-rosetta`
task updates rosetta and its other dependencies (one of which is a parallel checkout of perennial, as of this writing)
.**

Check status:
`sudo systemctl status rosetta`

View the log:
`sudo journalctl -t rosetta`

Configuration
-------------

There are a number of configuration parameters that are used by rosetta, and these are generally stored in the
`~/.phet/rosetta-config.json` file for the account under which the process is being run. To best understand what this
file contains, take a look at the instances of the file on phet-server2 and phet-server-dev, and to examine the source
file `getRosettaConfig.js`

Setting Rosetta to "Maintenance Mode"
-------------------------------------

Sometimes it's necessary to take Rosetta offline so the updates can be made or so that behind-the-scenes updates to
translation files can be made. There is a feature for this, and it will cause users to see a page that says something
like "The PhET translation utility is down for maintenance, please try again later." To put rosetta into this mode:

+ Make sure that no one is actively using it by looking at the log (see instructions above).
+ Edit the configuration file `~/.phet/rosetta-config.json` to have the key-value pair `"enabled": false`.
+ Restart Rosetta using the commands described above.

Set the value of `enabled` back to true and perform another restart to set Rosetta back to normal operation.

Triggering a Rebuild Without Being Credited
-------------------------------------------

### Background/Context

There have been times when a need has arisen to build (or rebuild) a simulation for a non-English locale. While one
might be tempted to do this via the normal translation interface by making and submitting a small change and then
reverting it and submitting again, this will unfortunately cause the submitter to be listed on the website as one of
the credited translators for that simulation. Issue https://github.com/phetsims/perennial/issues/178 describes a
scenario where the need to trigger builds without being credited arose. To fill this need, a route was added through
which a PhET team member can trigger a build of a simulation for a given locale. There are three parameters for this
route: the sim name, the locale, and the user ID that should be credited. The user ID can be obtained by looking in
babel for the user ID of the most recent translator.

### Instructions

1. If necessary, edit the babel file for the translation as needed. Commit directly to master.
2. Make sure the instance of Rosetta that you plan to use has sendBuildRequests = true in its config file. If you're
   using the public version, this will generally be set to true.
3. Obtain the user ID you wish to use from Babel.
4. Create and enter your URL in a web browser (you will be asked to sign in if you aren't already). Use the following
   URL pattern: `https://ox-dev.colorado.edu/translate/trigger-build/{sim-name}/{locale code}/{translator ID}`. For
   example, `https://phet.colorado.edu/translate/trigger-build/circuit-construction-kit-ac/fa/333624`:
5. Check Rosetta's logs and the build server's logs as desired. These log files are located on phet-server/ox-dev and
   will require SSH to view.
6. Make sure your build went through successfully and the translation is published to the website. (This should take
   about five minutes.)

To use this, enter this URL in a browser window and then check some time later that the translation was rebuilt. You
can monitor rosetta and/or the build server log if desired.

Test and Debug Support
----------------------

Since rosetta can be used at any time, we generally try to avoid taking it down for testing. It is set up to also run
on phet-server-dev. The directory structure is the same as that used on phet-server2.

The URL to access the version running on phet-server-dev is https://ox-dev.colorado.edu/translate.

On phet-server-dev, the configuration file `rosetta-config.json` is generally set up so that the value of the
`babelBranch` parameter is set to `tests`. This allows translations to be committed to a different branch of
the babel repository (where the translated string files live) so that they don't affect "real" translations. The down
side of this is that there aren't many real translations on this branch, so it is sometimes necessary to manually move
some over from the master branch for more realistic testing.
