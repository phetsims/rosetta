Administration Guide for the PhET Translation Utility
=====================================================

Note: This isn't very complete at this time, but it seemed important to have a place where some information is kept that
would enable PhET developers to administer this utility.

Background
----------

Rosetta, also known as the translation utility, is a Node.js-based server app that runs on phet-server. As of this
writing, the code on phet-server is kept in the directory /data/share/phet/rosetta, and Git is used to pull updates.  
When an update is pulled, the rosetta process needs to be restarted before the change will take effect (see below).

The process is run under the phet-admin account on phet-server.

The utility is accessed at the URL https://phet.colorado.edu/translate.

Starting, Stopping, and Checking
--------------------------------

You must have sudo privileges to execute the following commands.

Restart:
`sudo systemctl restart rosetta`

Stop:
`sudo systemctl stop rosetta`

Check status:
`sudo systemctl status rosetta`

View the log:
`sudo journalctl -t rosetta`

To disable: 
Rosetta has a little bit of built-in support for taking it down for maintenance. To do this, i.e. to put up the "down
for maintenance" page that users will see if the try to translate something, do the following: As of 2/13/2019, this is
in flux, but the way to do it is edit the ENABLED flag in the version of rosetta.js that is running on phet-sever (see
the comment in the file), then restart rosetta using the command above.

Configuration
-------------

There are a number of configuration parameters that are used by rosetta, and these are generally stored in the
`~/.phet/rosetta-config.json` file. To best understand what this file contains, it's probably best to take a look at
the instances of the file on phet-server and phet-server-dev, and to examine the source file `getRosettaConfig.js`

Setting Rosetta to "Maintenance Mode"
-------------------------------------

Sometimes it's necessary to take Rosetta offline so the updates can be made or so that behind-the-scenes updates to
translation files can be made. There is a feature for this, and it will cause users to see a page that says something
like "The PhET translation utility is down for maintenance, please try again later." To set the mode:

+ Make sure that no one is actively using it by looking at the log (see instructions above for how to see the log).
+ Edit the configuration file `~/.phet/rosetta-config.json` to have a value `"enabled": false`.
+ Restart Rosetta using the commands described above.

Set the value of `enabled` back to true and perform another restart to set Rosetta back to normal operation.

Test and Debug Support
----------------------

Since rosetta can be used at any time, we generally try to avoid taking it down for testing. It is set up to also run
on phet-server-dev. The directory structure is the same as that used on phet-server.

The URL to access the version running on phet-server-dev is https://ox-dev.colorado.edu/translate.

The URL to access the utility from phet-server-dev is https://ox-dev.colorado.edu/translate.

On phet-server-dev, the configuration file `rosetta-config.json` is generally set up so that the value of the 
`babelBranch` parameter is set to `tests`. This allows translations to be committed to a different branch of
the babel repository (where the translated string files live) so that they don't affect "real" translations. The down
side of this is that there aren't many real translations on this branch, so it is sometimes necessary to manually move
some over from the master branch.