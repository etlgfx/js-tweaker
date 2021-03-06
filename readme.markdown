[![Build Status](https://travis-ci.org/etlgfx/js-tweaker.svg?branch=master)](https://travis-ci.org/etlgfx/js-tweaker)
# js-tweaker
Simple configuration management, intended for use with node.js. Minimal
dependencies.

This library lets you define a set of configuration files for different
environments easily.

Initially created for [Viafoura](https://github.com/viafoura)

## Installation
Install using NPM:

`npm install js-tweaker --save`

## Usage
First define your configuration files. These can be either `.js` or `.json`
files. The default location for these files is in the `config/` directory of
your project root. You can define application wide defaults using a `default.json` or
`default.js` file.

A typical project tree could look something like this:

```
| config/
\-- config/default.json
\-- config/development.js
\-- config/live.js
| app.js
```

`default.json`

```javascript
{
    "key": "value"
}
```

`development.js`

```javascript
module.exports = {
    key: "development"
};
```

`live.js`

```javascript
module.exports = {
    key: "live"
};
```

To read the configuration files into your application:

```javascript
var jsTweaker = require('js-tweaker');

//optionally customize the behavior
jsTweaker.options({
    // options (and default values)
    // configDir: "./config/", //path to config files
    // env: "dev", //any environment identifier you like, defaults to process.env.NODE_ENV or 'development'
    // fileList: ['default', '{ENV}'], //which order to search for files
});

jsTweaker(function (err, config) {
    if (err) {
        //something went wrong
    }
    //configuration is loaded

    //config.env property is automatically set to the value you originally
    //passed in
});
```

Alternatively, if you don't want to use a callback, simply don't pass in any
parameters, and the config is loaded synchronously and returned.

```javascript
var jsTweaker = require('js-tweaker');

jsTweaker.options({}); //set some options

try {
    var config = jsTweaker(); //get the config
}
catch (e) {
    //an exception will be thrown on error
}
```

Or the shorthand:

```javascript
var config = require('js-tweaker')();
```

## Options

###`configDir`
The `configDir` option can be used to customize the directory that is searched
for configuration files.

###`env`
The `env` option determines which environment specific configuration file(s) are
loaded.

###`fileList`
The `fileList` option is the most powerful, and lets you load multiple
configuration files and merge them together in the order you like. You can
specify a substitution macro for the selected environment by putting `{ENV}`
anywhere in a string.

* Only load a single config file:
  ```javascript
["custom"]
  ```

* Only load a single environment specific config file:
  ```javascript
["{ENV}"]
  ```

* Load a default file and then merge in an environment specific file:
  ```javascript
['default', '{ENV}']
  ```

* Load a default file and then merge in a variety of different configs:
  ```javascript
['default', '{ENV}/database', '{ENV}/filesystem', '...']
  ```
  This could let you organize your configuration files very nicely by keeping
  separate categories of options apart.
