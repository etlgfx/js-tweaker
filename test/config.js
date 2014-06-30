var config = require('../lib/config'),
	assert = require('assert');

describe('config', function () {
	it('uses env parameter', function () {
		assert.equal(config({env: 'dev'})().env, 'dev');
	});

	it('defaults to `development`', function () {
		var old = process.env.NODE_ENV;

		//cannot be set to undefined, must be a String!!
		process.env.NODE_ENV = '';
		assert.equal(config()().env, 'development');
		process.env.NODE_ENV = old;
	});

	it('uses process.env.NODE_ENV', function () {
		var old = process.env.NODE_ENV;

		process.env.NODE_ENV = 'custom';
		assert.equal(config()().env, 'custom');
		process.env.NODE_ENV = old;
	});
});
