var dev = require("can-util/js/dev/dev");
var makeArray = require("can-util/js/make-array/make-array");
//var canString = require("can-util/js/string/string");

function makeExpectation(type) {
  var original;
  var expectedResults = [];

  function stubbed() {
    var message = makeArray(arguments).join(" ");

    expectedResults.forEach(function(expected) {
      var matched = typeof expected.source === "string" ? 
        message === expected.source :
        expected.source.test(message);

      if(matched) {
        expected.count++;
      }
      if(typeof expected.fn === "function") {
        expected.fn.call(null, message, matched);
      }
    });
  }

  return function(expected, fn) {
    var matchData = {
      source: expected,
      fn: fn,
      count: 0
    };
    expectedResults.push(matchData);

    if(!original) {
      original = dev[type];
      dev[type] = stubbed;
    }

    // Simple teardown
    return function() {
      expectedResults.splice(expectedResults.indexOf(matchData), 1);
      if(original && expectedResults.length < 1) {
        // restore when all teardown functions have been called.
        dev[type] = original;
        original = null;
      }
      return matchData.count;
    };
  };
}

module.exports = {
  willWarn: makeExpectation("warn"),

  willError: makeExpectation("error")
};