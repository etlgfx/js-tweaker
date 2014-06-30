var _ = require('lodash'),
	fs = require('fs'),
	path = require('path');

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
 * @param {Object} options
 *                 {
 *                     fileList: Array - with {ENV} macros substituted
 *                     env: String
 *                     configDir: String - path
 *                 }
 *
 * @return Function - a function that reads configuration parameters
 */
module.exports = function (options) {
	options = options || {};

	var fileList = options.fileList || ['default', '{ENV}'];
	var nodeEnv = options.env || process.env.NODE_ENV || 'development';
	var configDir;

	if (options.configDir && fs.statSync(options.configDir).isDirectory()) {
		configDir = path.resolve(options.configDir);
	}
	else {
		configDir = process.env.NODE_CONFIG_DIR || process.cwd() + '/config';
	}

	if (!fileList instanceof Array) {
		throw new TypeError('fileList must be an array');
	}

	fileList = fileList.map(function (f) {
		return f.replace(/\{ENV\}/, nodeEnv);
	});

	/**
	 * @param Function callback(err, config)
	 *
	 * @return Object config
	 */
	return function (cb) {
		var config = {};

		var err = null;

		try {
			fileList.forEach(function (f) {
				_.merge(config, loadConfigFile(configDir, f));
			});
		}
		catch (err) {
			if (cb instanceof Function) {
				cb(err);
			}
			else {
				throw err;
			}
		}

		_.merge(config, {env: nodeEnv});

		if (cb) {
			cb(err, config);
		}
		else {
			return config;
		}
	};
};
