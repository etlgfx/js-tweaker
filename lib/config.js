var _ = require('lodash'),
	fs = require('fs'),
	path = require('path');

var _options = {
    fileList: ['default', '{ENV}'],
    configDir: process.env.NODE_CONFIG_DIR || process.cwd() + '/config',
    env: process.env.NODE_ENV || 'development',
};

var _configCache; //undefined

/**
 * reset _configCache variable to undefined to force config() to reread config files
 */
function resetConfigCache() {
    _configCache = undefined;
}

/**
 * @param {String} full path to config directory
 * @param {String} file base name to read (automatically find .json and .jsfiles)
 *
 * @throw Exception JSON parse error
 *
 * @return Object containing configuration values found
 */
function loadConfigFile(path, file) {
	var config = {};

	[
		{
			ext: '.json',
			cb: function (filename) {
				return JSON.parse(fs.readFileSync(filename));
			}
		},
		{
			ext: '.js',
			cb: require
		}
	].some(function (test) {

		var fullPath = path +'/'+ file + test.ext;

		if (fs.existsSync(fullPath)) {
			config = test.cb(fullPath);
			return true;
		}
	});

	return config;
}

/**
 * Retrieve merged configs as an object
 *
 * @param Function callback(err, config)
 *
 * @return Object config
 */
function config(cb) {
    if (_configCache === undefined) {
        var fileList = _options.fileList.map(function (f) {
            return f.replace(/\{ENV\}/, _options.env);
        });

        _configCache = {};

        var err = null;

        try {
            fileList.forEach(function (f) {
                _.merge(_configCache, loadConfigFile(_options.configDir, f));
            });
        }
        catch (err) {
            if (cb instanceof Function) {
                process.nextTick(function () {
                    cb(err);
                });
            }
            else {
                throw err;
            }
        }

        _.merge(_configCache, {env: _options.env});
    }

    if (cb) {
        process.nextTick(function () {
            cb(err, _configCache);
        });
    }
    else {
        return _configCache;
    }
}

/**
 * override default options
 *
 * @param {Object} options
 *                 {
 *                     fileList: Array - with {ENV} macros substituted
 *                     configDir: String - path
 *                     env: String
 *                 }
 *
 * @return {Object} options (clone)
 */
config.options = function (options, callback) {
	options = options || {};

    var changed = false;

    if (options.fileList) {
        if (!options.fileList instanceof Array) {
            throw new TypeError('fileList must be an array');
        }

        changed = true;
        _options.fileList = options.fileList;
    }

    if (options.env) {
        changed = true;
        _options.env = options.env;
    }

    if (options.configDir && fs.statSync(options.configDir).isDirectory()) {
        changed = true;
        _options.configDir = path.resolve(options.configDir);
    }

    if (changed) {
        resetConfigCache();
    }

    return _.clone(_options);
};

module.exports = config;
