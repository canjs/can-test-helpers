/*can-test-helpers@1.1.3#lib/dev*/
define('can-test-helpers/lib/dev', [
    'require',
    'exports',
    'module',
    'can-log/dev/dev',
    'can-reflect',
    'can-global'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        var dev = require('can-log/dev/dev');
        var canReflect = require('can-reflect');
        var GLOBAL = require('can-global');
        function makeExpectation(type) {
            var original;
            var expectedResults = [];
            function stubbed() {
                var message = canReflect.toArray(arguments).map(function (token) {
                    if (typeof token !== 'string' && token.message) {
                        return token.message;
                    } else {
                        return token;
                    }
                }).join(' ');
                expectedResults.forEach(function (expected) {
                    var matched = typeof expected.source === 'string' ? message === expected.source : expected.source.test(message);
                    if (matched) {
                        expected.count++;
                    }
                    if (typeof expected.fn === 'function') {
                        expected.fn.call(null, message, matched);
                    }
                });
            }
            return function (expected, fn) {
                var matchData = {
                    source: expected,
                    fn: fn,
                    count: 0
                };
                expectedResults.push(matchData);
                if (!original) {
                    original = dev[type];
                    dev[type] = stubbed;
                }
                return function () {
                    expectedResults.splice(expectedResults.indexOf(matchData), 1);
                    if (original && expectedResults.length < 1) {
                        dev[type] = original;
                        original = null;
                    }
                    return matchData.count;
                };
            };
        }
        module.exports = {
            willWarn: makeExpectation('warn'),
            willError: makeExpectation('error'),
            devOnlyTest: function () {
                var global = GLOBAL();
                if (!global.System || !global.System.env || global.System.env.indexOf('production') < 0) {
                    if (!global.test && global.QUnit) {
                        global.test = global.QUnit.test;
                    }
                    global.test.apply(null, arguments);
                }
            }
        };
    }(function () {
        return this;
    }(), require, exports, module));
});