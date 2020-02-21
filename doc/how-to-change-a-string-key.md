How to Change a String Key
==========================

Intro
-----

Rosetta, aka "the translation utility", has never had much of a budget supporting it.  As a result, it is very basic,
and lacks support for a number of features that would be nice to have.  One such feature is the ability to change a
string key after a simulation has been published and one or more translations of it have been submitted.  However, it is
possible to do this - it just requires a number of manual steps.  This document describes these steps, and also provide
background information for understanding why the steps are necessary. 

Background
----------

The basic steps through which Rosetta creates and maintains a translation for a given sim are as follows:
+ Extract a list of the used strings from the published version of the sim, including the repository and key for each
string
+ Get the English value of the strings for the sim from the release branch of the simulation
+ Get the English value of the strings for common components from the master version of each common repo
+ Get the translated values, if any, for each string used by the simulation from the babel repository
+ Construct a page with the string keys, Enlish values, and previously submitted translated values, and present this
to the translator

At this point, the traslator can input or revise values for all of the strings used in the simulation.  It is possible
to test the sim with the new values without submitting them, but that feature isn't particularly relevant to this
docment.  Once the translator is ready, the submit their translated strings.  At that point, Rosetta:

+ Commits and pushes the translated strings for both the simulation and the common code repost to the babel repository
+ Commands the build server to build a new version of the sim for the locale for which the translation was submitted

Given this process, and the fact that some of the string files are maintained on master and some on branches, changing
a string key is a bit tricky.  

For a simulation, if a string key is changed on master and not in the release branch, that key will not be shown to the
user (since the string values are extracted from the published sim).  The next time the sim is published from master,
there will be no values for the new key in the translated string files, and the sim will fall back to the English
version of the string.  In essence, the previous work done be translators for that string will be lost, and the
translators wouldn't be notified.  Also, an unused string key would be carried forward in the translated string file,
which doesn't cause any bad behavior, but adds clutter.  So, in this case, the string key should be changed on master
and on the release branch, and every instance of the key should be updated in babel, and then a maintenance release
should be made for the simulation, which will cause all translations to be rebuilt.

For common code, the behavior would be similar but the solution is a bit different.  As in the case with a sim string,
a string key that was changed on master would never be presented to the translator, since it wouldn't be used in the
published version of any sim.  The solution in this case is to change the key on master, change it in all translations
in babel, then do a maintenance release that rolls in this change to every published simulation that uses the string.
In some cases, such as a commonly used joist string, this could literally be every single simulation.  Yeah, yikes, I
know.

Changing a String Key for a Simulation
--------------------------------------

Below are the steps for changing a string in a simulation (as opposed to common code).  This is done as a checklist so
that it can be easily pasted into a GitHub issue.

The checklist is written assuming a single string key is being changed, but the same process applies for multiple string
keys, and several can be changed at once if necessary.

- [ ] For later verification, make a record of the string key that is changing and its value for at least one
translation (bonus points for doing multiple translations)
- [ ] Put Rosetta into maintenance mode to avoid any translation submissions while this is in progress (see the Admin
Guide for information on how to do this).
- [ ] Change the value of the string key on master.
- [ ] Change the value of the string key on the release branch.
- [ ] Change the value of the string key in all translations on the master branch in babel.
- [ ] Create a new RC on the release branch.
- [ ] Check if there are any unverified changes on this branch.  If there are, make sure that the appropriate amount of
testing is performed on the RC before publishing (the details of what is "appropriate" is beyond the scope of this
document).  If there are no such changes, it is generally fine to move forward with publication without verification.
- [ ] Publish the simulation.  Don't move to the next step until this is complete.
- [ ] Take Rosetta out of maintenance mode (again, see the Admin Guide for information on how to do this).
- [ ] Verify that the string key change worked by going to Rosetta (https://phet.colorado.edu/translate/), selecting the
simulation for which the update or updates were made, chossing a locale for which a translation exists, pressing "Go",
and verifying that the old string key is gone, the new one is shown, and the value of the new one is correct.  Do this
for all locales for which values were recorded above.

If the verification fails, you'll need to figure out why and fix it (obviously).

Changing a String Key for a Common Code Repository
--------------------------------------------------

Below are the steps for changing a string in a common code repository (as opposed to in a simulation).  This is done as
a checklist so that it can be easily pasted into a GitHub issue.

The checklist is written assuming a single string key is being changed, but the same process applies for multiple string
keys, and several can be changed at once if necessary.

- [ ] Make a list of all simulations that are currently using the key.
- [ ] For later verification, make a record of the string key that is changing and its value for at least one
translation and simulation (bonus points for doing multiple translations)
- [ ] Put Rosetta into maintenance mode to avoid any translation submissions while this is in progress (see the Admin
Guide for information on how to do this).
- [ ] Change the value of the string key on master.
- [ ] Change the value of the string key in all translations on the master branch in babel.
- [ ] Do a maintenance release for every simulation that is currently using this string.  This can be quite an
involved process, and is well beyond the scope of this document, so please refer to 
https://github.com/phetsims/perennial/blob/master/doc/automated-maintenance-process.md, and you'll also probably need to
consult with @jonathanolson.
- [ ] Publish the maintanance releases.  Make sure that you don't move to the next step until this is complete.
- [ ] Take Rosetta out of maintenance mode (again, see the Admin Guide for information on how to do this).
- [ ] Verify that the string key change worked by going to Rosetta (https://phet.colorado.edu/translate/), selecting a
simulation that used the changed key, chossing a locale for which a translation exists, pressing "Go", and verifying
that the old string key is gone, the new one is shown, and the value of the new one is correct.  Do this for all locale
and simulation combinations for which values were recorded above.

If the verification fails, you'll need to figure out why and fix it (obviously).
