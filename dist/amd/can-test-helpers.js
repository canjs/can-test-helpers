/*can-test-helpers@1.1.3#can-test-helpers*/
define('can-test-helpers', [
    'require',
    'exports',
    'module',
    'can-test-helpers/lib/dev'
], function (require, exports, module) {
    var dev = require('can-test-helpers/lib/dev');
    module.exports = { dev: dev };
});