# Rosetta

Rosetta is a tool for translating PhET simulations. It is built using the MERN tech stack: MongoDB, Express, React, and
Node.

## Quick Start

```shell
# go to the directory where you keep your phet repos
cd path/to/your/phet/repos

# get the code, go to the code, and install dependencies
git clone git@github.com:phetsims/rosetta.git
cd rosetta
npm install

# if you don't have a copy of chipper, get one, go to it, and install dependencies
cd path/to/your/phet/repos
git clone git@github.com:phetsims/chipper.git
cd chipper
npm install

# otherwise, update chipper
cd path/to/your/phet/repos
cd chipper
git pull
npm prune && npm update

# if you don't have a `~/.phet` directory, make one
mkdir ~/.phet

# if you don't have a config file, make one and ask the maintainer to help you populate it
touch ~/.phet/rosetta-config.env

# add git hooks using husky
npm run pre

# compile/bundle react frontend using babel/webpack and serve static files for development
npm run dev

# compile/bundle react frontend using babel/webpack and serve static files for production
npm run pro
```