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

This document attempts to summarize the release process that @jbphet
and I (Liam Mulhall) envision for our new version of Rosetta,
which we've taken to calling Rosetta 2.0.

Rosetta's release process is different from the release process for
PhET sims. Read on to find out how.

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
+ Subsequent releases will follow Bastardized Semantic Versioning:
  + Given a version number MAJOR.MINOR.PATCH, increment the:
    + MAJOR version when you make incompatible API changes
    + MINOR when you've got big new feature(s)
    + PATCH when you've got a bug fix(es) and/or minor feature(s) ready
    + Additional labels for pre-release and build metadata are available as
      extensions to the MAJOR.MINOR.PATCH format.
    + If you are putting a version of rosetta in for testing, you 
      should tag your commit `MAJOR.MINOR.PATCH-rc.x` where `x` is
      a number you increment each time you put a version in for 
      testing. In this context, `rc` stands for "release candidate". 
      For more info on this, see the section on tagging test versions.

Tag Test Versions
-----------------

+ To do this: `git tag -a <version-number>-rc.<rc-number>`.
+ For example: `git tag -a 2.0.0-rc.3`.
+ This should open up your editor where you can write a
  tag message. In this message, you should at least include
  the GitHub issue where testing was done. Ideally, you should
  also include some background/context for the version.
+ To view a tag's message: `git show <tag-name>`.
+ For example: `git show 2.0.0-rc.3` (This is a real tag; try it!)
+ To rename a tag (this only works before pushing to the remote):
  `git tag <new-name> <old-name>`.
+ To edit a tag's message (this will change the metadata of the
  tag, e.g. date and author): `git tag <tag-name> <tag-name>^{} -f -a`.
+ To push your tags to the remote: `git push --tags`.
+ **Remember** to put the SHAs for chipper and perennial-alias in the
  `dependencies.json` file.

Tag Published Versions
----------------------

+ To get the version number for Rosetta, take the current version,
  and follow the algorithm described in the section on versioning.
+ To do this: `git tag -a <version-number>`.
+ See the section on tagging test versions for more info on tagging
  test versions.
+ **Remember** to put the SHAs for chipper and perennial-alias in the
  `dependencies.json` file.
+ On the production server, pull the tag for the release version as
  opposed to pulling the latest commit.

Write Down Dependencies
-----------------------

+ Add the SHAs for Rosetta's dependencies that were used in testing
  to the `dependencies.json` file.