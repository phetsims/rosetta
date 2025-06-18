# Rosetta

Rosetta is a tool for translating PhET simulations. It is built using the MERN tech stack: MongoDB, Express, React, and
Node.

## Quick Start

1. Make sure you have git installed on your system and in your PATH.
   - On Windows, you can install git from [git-scm.com](https://git-scm.com/download/win).
   - On macOS, you can install git using Homebrew with `brew install git`.
2. Make sure you have Node.js and npm installed on your system.
   - You can download Node.js from [nodejs.org](https://nodejs.org/).
   - After installing Node.js, you can verify the installation by running `node -v` and `npm -v` in your terminal.
   - If you are using Windows, make sure to add Node.js to your PATH during installation.
3. Execute `git clone https://github.com/phetsims/rosetta.git`
4. Execute `cd rosetta && npm install`
5. Execute `./scripts/sh/bootstrap.sh`
6. Execute `npm run update-dependencies`
7. Rosetta requires a configuration file to run. You can create a sample configuration file by copying sampleConfig.json 
   from this repository into <your-home-dir>/.phet/rosetta-config.json.  There are several pieces of information that
   would be a security risk to include in the sample file, so if you're a PhET developer, you will need to work with
   other devs to get values for those fields.