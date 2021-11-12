# How to Use Grunt

Don't

```shell
grunt lint
```

Do

```shell
grunt --gruntfile Gruntfile.cjs lint
```

The reason for this is complicated. We need to use the `/phetsims/chipper` Gruntfile, but the `/phetsims/chipper`
Gruntfile is a CommonJS module. Because Rosetta has `"type": "module` in its `package.json`, its `.js` files are treated
as ECMAScript modules. We make Rosetta's Gruntfile a CommonJS module by adding the `.cjs` file extension. However, when
we do this, Grunt can't find a Gruntfile because it's looking for `Gruntfile.js`. Thus, we need to explicitly tell Grunt
about our Gruntfile.