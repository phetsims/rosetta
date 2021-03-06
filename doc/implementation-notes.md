Implementation Notes for the PhET Translation Utility
=====================================================

Intro
-----

This document provides an overview of the way the translation utility works. The intended audience is developers who
need to understand the utility, and want to get some "big picture" information before jumping into the code.

Terminology
-----------

The term 'project name' is used throughout the code as a means to reference a simulation or common code library. This
is essentially the repository name, but the term 'repository name' was avoided in case another VCS system is adopted
at some point in the future. Examples of project names are 'build-an-atom', 'energy-skate-park-basics' and 'scenery'.

Dependencies
------------

The utility relies on the node module [octonode](https://github.com/pksunkara/octonode) for commits to GitHub via the
GitHub API. Rosetta does not write or read from disk, it always interacts directly with files on GitHub. Any commits to
GitHub are queued so that only one commit can happen at a time.

Rosetta uses a PostgreSQL database to support temporarily saving strings. Strings are saved in a table with primary key:
userid, stringkey, repository, locale. Strings are deleted from the table after the sim is submitted to babel.

Basic Operation
---------------

1. When a user goes to translate a sim, Rosetta first sends a request to the published version of the sim and extracts
all of the string keys. The keys are extracted into an object of this form:

        [ 
          {
            projectName: area-builder,
            stringKeys: [ 'level', 'title' ]
          },
          {
            projectName: joist,
            stringKeys: [ 'credits.title', 'credits.team' ]
          },
          {
            projectName: vegas,
            stringKeys: [ 'check', 'keepTrying' ]
          }
        ]
        
2. For every repository in the extracted strings list, Rosetta sends 2 requests to GitHub, one for the English string 
values and one for the translated string values for the locale being translated. It also sends a request to get the 
active-sims list from chipper, so it can tell if a repository is sim code or common code. All of these strings are 
rendered into a form where users can input their translations. It is important to note that the translated string
values for common code strings are obtained from the master branch so that Rosetta doesn't have to try to merge changes
from branches. This means that common code strings need to remain pretty stable. 
3. If a user presses "Save", strings are saved in PostgreSQL and automatically loaded the next time the user goes to
translate that sim and locale. When the translation for that sim and locale is finally submitted, the saved strings are
deleted from PostgreSQL. It's important to note that the databases that support string saving on phet-server and
phet-server-dev are not available through the firewall, so the Rosetta instances are generally configured to use a
`localhost` URL to reach the database. This makes it challenging to verify the database behavior if running Rosetta
locally (more on this in the "Debugging Notes" section).
4. If a user presses "Test", the strings are fed into a published sim via query parameters, so the user can see what the
translation will look like once they submit.
5. When a user submits, the strings are committed to GitHub. Submissions are queued so that only one can happen at a
time to avoid merge conflicts. If a push to GitHub fails, Rosetta tries again in 5 seconds. If that push fails, then an
error is displayed with the strings that failed to push. Rosetta commits and pushes using the GitHub API wrapper
octonode.
6. When the submissions of changed strings are complete, a request is made to the build server to build and publish the
updated translation.

Debugging Notes
---------------

When testing and debugging, it generally works best to run it on a local machine and work out major issues, then test
on phet-server-dev, then deploy it to phet-server. When running locally, the "Save" function is hard to get working
since it requires a database, so that is often just allowed to error out. To get it to work correctly on phet-server-dev, it
may be necessary to sync phet-server-dev to phet-dev. As of this writing, this is done by contacting @mattpen and
asking him to do it (see https://github.com/phetsims/website/issues/974).

It can be useful to disable certain steps in the translation process while debugging to prevent excessive commits
to GitHub and to prevent unneeded build requests to the build server. The configuration parameters 
`performStringCommits` and `sendBuildRequests` are supported. Please look through the code to see how these are used.
They are considered true if not present, so they may not be present in the configuration files on the servers.

There is a branch called 'tests' that is set up in the babel repo and is used for submitting translations without
affecting any of the "real" translations in the master branch. This is set using the "babelBranch" value in the
`build-local.json` file.  It is in `build-local.json` rather than `rosetta-config.json` because this value is also used
by the build server when building translations.