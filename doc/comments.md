# Comments

Here we describe our comment styles.

## Single-Line Comments

```js
// single-line comments all lowercase
// single-line comments not full sentences
// single-line comments eschew punctuation
```

## Multiline Comments

```js
/*
 * Multiline comments use proper capitalization.
 * Multiline comments use full sentences.
 * Multiline comments use proper punctuation.
 */
```

## JSDoc

```js

/**
 * The description of the function should be written with proper capitalization, full sentences, and proper punctuation.
 * Leave an empty line between the description and the list of parameters.
 *
 * @param {String} name - name of person we want to greet (this isn't a full sentence and doesn't require punctuation)
 */
const greet = ( name ) => {
  console.log( `hello, ${name}` );
};

```