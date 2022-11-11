# NPM Workspaces

## Background

This repository is different from other PhET repositories in that it uses
[NPM workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces). NPM
workspaces allow you to have multiple `package.json`s in one project.

I (Liam Mulhall) chose to use NPM workspaces because it allows us to have a
`client` directory that is set up as if it were its own repository. Ditto for
the `server` directory. The frontend/client dependencies are separate from the
backend/server dependencies.

## How Workspaces Are Configured

There is a `package.json` in the root of the phetsims/rosetta repository that
specifies the workspaces. This `package.json` doesn't have any dependencies, it
just specifies the workspaces, and has some scripts.

## Installing Dependencies in Workspaces

If you need to install a `client` package, you could change your directory to
the `client` directory and then `npm install` the package. This would add the
package to the `client` directory's `package.json`. Alternatively, you could
specify the workspace you want to install a package to:
`npm install foo --workspace=client` or `npm i foo -w client`.

## Running Scripts Defined in a Workspace

If there is a script in the `client` directory/workspace you want to run, you
could change your directory to `client` and then run the script, or you could
specify the workspace that has the script: `npm run bar --workspace client` or
`npm run bar -w client`.