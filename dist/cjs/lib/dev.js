/*can-test-helpers@1.0.0#lib/dev*/
var dev = require('can-util/js/dev/dev');
var makeArray = require('can-util/js/make-array/make-array');
var GLOBAL = require('can-util/js/global/global');
function makeExpectation(type) {
    var original;
    var expectedResults = [];
    function stubbed() {
        var message = makeArray(arguments).map(function (token) {
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
            global.test.apply(null, arguments);
        }
    }
};