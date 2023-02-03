Release Process
===============

Contents
--------

- [Background](#background)
- [Do Work on Feature Branches](#do-work-on-feature-branches)
- [Use Semantic Versioning](#use-semantic-versioning)
- [Tag Test Versions](#tag-test-versions)
- [Tag Published Versions](#tag-published-versions)
- [Write Down Dependencies](#write-down-dependencies)

Background
----------

This document attempts to summarize the release process that John
Blanco and I (Liam Mulhall) envision for our new version of Rosetta,
which we've taken to calling Rosetta 2.0.

As of this writing, Rosetta 2.0 is almost ready for publication. The
work for Rosetta 2.0 has all been done on a branch called "twosetta".
One of the items on our list of things to do before publication is
to merge the "twosetta" branch into the master branch. This got us
thinking about the following:

+ Should work be done on a feature branch or should we create
  release branches?
+ How do we version Rosetta?
+ Should we be tagging the SHAs of versions of Rosetta that go
  into testing?
+ Should we tag the SHA of versions of Rosetta that are
  published?
+ Should we keep track of the SHAs of our PhET dependencies
  (chipper and perennial) and associate those with our tagged
  Rosetta SHAs somehow?

Right now, here's what I (Liam Mulhall) have decided to do:

Do Work on Feature Branches
---------------------------

Do your work on a feature branch. Once you are confident your
work is ready, you can ask someone to review it, have it tested,
or merge it into master at your discretion. If you ask someone
to review your code or if you have it tested, you should only
merge it into master once the reviewer or tester approves the
changes. If you merge the work into master without review or
testing, you need to be confident you aren't breaking anything.

Use Semantic Versioning
-----------------------

+ The version of the initial publication of "Rosetta 2.0" will be 2.0.0.
+ Subsequent releases will follow Semantic Versioning:
  + Given a version number MAJOR.MINOR.PATCH, increment the:
    + MAJOR version when you make incompatible API changes
    + MINOR version when you add functionality in a backwards compatible
      manner 
    + PATCH version when you make backwards compatible bug fixes 
    + Additional labels for pre-release and build metadata are available as
      extensions to the MAJOR.MINOR.PATCH format.

Tag Test Versions
-----------------

+ To do this: `git tag -a <version-number>-rc-<rc-number>`.
+ For example: `git tag -a 2.0.0-rc-3`.
+ This should open up your editor where you can write a
  tag message. In this message, you should at least include
  the GitHub issue where testing was done. Ideally, you should
  also include some background/context for the version.
+ To view a tag's message: `git show <tag-name>`.
+ For example: `git show 2.0.0-rc-3` (This is a real tag; try it!)
+ To rename a tag (this only works before pushing to the remote):
  `git tag <new-name> <old-name>`.
+ To edit a tag's message (this will change the metadata of the
  tag, e.g. date and author): `git tag <tag-name> <tag-name>^{} -f -a`.
+ To push your tags to the remote: `git push --tags`.
+ **Remember** to put the SHAs for chipper and perennial in the
  `dependencies.json` file.

Tag Published Versions
----------------------

+ To get the version number for Rosetta, take the current version,
  and follow the algorithm described in the section on versioning.
+ To do this: `git tag -a <version-number>`.
+ See the section on tagging test versions for more info on tagging
  test versions.
+ **Remember** to put the SHAs for chipper and perennial in the
  `dependencies.json` file.

Write Down Dependencies
-----------------------

+ Add the SHAs for Rosetta's dependencies that were used in testing
  to the `dependencies.json` file.