var config = require('../lib/config'),
	assert = require('assert');

describe('config', function () {
    var defaults;

    before(function () {
        defaults = config.options({
            configDir: 'test/conf'
        });
    });

    describe('#options', function () {
        beforeEach(function () {
            config.options(defaults);
        });

        it('defaults to `development`', function () {
            //cannot be set to undefined, must be a String!!
            assert.equal(config().env, 'development');
            assert.equal(config.options().env, 'development');
        });

        it('uses env parameter', function () {
            assert.equal(config.options({env: 'dev'}).env, 'dev');
            assert.equal(config().env, 'dev');
        });

        it('changes directory and throws not found error', function () {
            assert.throws(function () {
                config.options({configDir: 'not found'});
            }, function (err) {
                return err instanceof Error && err.code === 'ENOENT';
            });
        });

        it('changes directory', function () {
            //we're already changing the config dir in beforeEach
            assert.equal(/test\/conf/.test(config.options().configDir), true);
        });
    });

    describe('#config', function () {
        beforeEach(function () {
            config.options(defaults);
        });

        it('reads default config', function () {
            assert.equal(config().key, 'value-default');
        });

        it('merges configs', function () {
            config.options({ env: 'custom' });
            assert.equal(config().key, 'value-custom');
            config.options({ fileList: ['{ENV}', 'default'] });
            assert.equal(config().key, 'value-default');
        });
    });
});
