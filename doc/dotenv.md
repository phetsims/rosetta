# dotenv

This repo uses dotenv, a popular package for environment variables. One thing to
keep in mind when using dotenv is that boolean variables like true and false
are cast as strings rather than as booleans. Thus, when you set something to
false, it is cast as 'false', which is a non-empty string and therefore a truthy
value.