Background
==========

This document is intended to give maintainers some background
information on the HTML5 sim translation utility.

Contents
--------

- [Legacy Sim Translation Files](#legacy-sim-translation-files)

Legacy Sim Translation Files
----------------------------

Some legacy sims (i.e. Java or Flash sims) had their translations
manually added to the long-term storage repository
(https://github.com/phetsims/babel, as of this writing). These
legacy string files have string keys and values, but nothing else.
Typically, a string file has string keys with a value, a timestamp,
an array of previous entries, etc. These legacy string files have
caused some issues, and they are something maintainers should be aware
of.

Here are some of the issues:
- https://github.com/phetsims/rosetta/issues/329#issuecomment-1371588737
- https://github.com/phetsims/rosetta/issues/375#issuecomment-1444581287
