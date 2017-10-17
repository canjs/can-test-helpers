/*can-test-helpers@1.0.1#can-test-helpers*/
define([
    'require',
    'exports',
    'module',
    './lib/dev'
], function (require, exports, module) {
    var dev = require('./lib/dev');
    module.exports = { dev: dev };
});