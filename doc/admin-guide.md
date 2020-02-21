Administration Guide for the PhET Translation Utility
=====================================================

Note: This isn't very complete at this time, but it seemed important to have a place where some information is kept that
would enable PhET developers to administer this utility.

Background
----------
Rosetta, also known as the translation utility, is a NodeJS-based server app that runs on phet-server.  As of this
writing, the code on phet-server is kept in the directory /data/share/phet/rosetta, and git is used to pull updates.  
When an update is pulled, the rosetta process needs to be restarted before the change will take effect (see below).

The process is run under the phet-admin account on phet-server.

The utility is accessed at the URL https://phet.colorado.edu/translate

Starting, Stopping, and Checking
---------------------

You must have sudo privileges to execute the following commands.

Restart:
```sudo systemctl restart rosetta```

Stop:
```sudo systemctl stop rosetta```

Check status:
```sudo systemctl status rosetta```

View the log:
```sudo journalctl -t rosetta```

To Disable: 
Rosetta has a little bit of built-in support for taking it down for maintenance.  To do this, i.e. to put up the "down
for maintenance" page that users will see if the try to translate something, do the following: As of 2/13/2019, this is
in flux, but the way to do it is edit the ENABLED flag in the version of rosetta.js that is running on phet-sever (see
the comment in the file), then restart rosetta using the command above.

Configuration
-------------

There are a number of configuration parameters that are used by rosetta, and these are generally stored in the
```~/.phet/build-local.json``` file along with a number of other configuration parameters used by PhET processes (such
as the build server).  The directories used on phet-server-dev are the same as those used on phet-server.  The URL to
access the utility from phet-server-dev is https://ox-dev.colorado.edu/translate.

NOTE 12/4/2019 - I (jbphet) am investigating using the `dotenv` package for some config vars, and should update this
section when the approach is finalized.

Test and Debug Support
----------------------

Since rosetta can be used at any time, we generally try to avoid taking it down for testing.  It is set up to also run
on phet-server-dev.  The directory structure is the same as that used on phet-server.

The URL to access the version running on phet-server-dev is https://ox-dev.colorado.edu/translate.

On phet-server-dev, the configuration file ```build-local.json``` is generally set up so that the value of the 
```babelBranch``` parameter is set to ```tests```.  This allows translations to be committed to a different branch of
the babel repository (where the translated string files live) so that they don't affect "real"  translations.  The down
side of this is that there aren't many real translations on this branch, so it is sometimes necessary to manually move
some over from the ```master``` branch.





