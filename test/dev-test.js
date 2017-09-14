var QUnit = require("steal-qunit");
var devUtils = require("can-test/lib/dev");
var dev = require("can-util/js/dev/dev");

QUnit.module("can-test/dev");

QUnit.test("willWarn stubs out dev.warn until restore is called", function() {
  var _warn = dev.warn;

  var restore = devUtils.willWarn();

  QUnit.notEqual(_warn, dev.warn, "warn function stubbed");

  restore();

  QUnit.equal(_warn, dev.warn, "warn function unstubbed");
});

QUnit.test("willWarn returns restore function", function() {
  var restore = devUtils.willWarn();

  QUnit.equal(typeof restore, "function", "function returned");

  restore();
});

QUnit.test("willWarn restore function gives zero result if no warnings.", function() {
  var restore = devUtils.willWarn();

  QUnit.equal(restore(), 0, "Zero incidents counted");
});

QUnit.test("willWarn matches strings", function() {
  var restore = devUtils.willWarn("foo");

  dev.warn("foo");

  QUnit.equal(restore(), 1, "Correct number of warnings reported");
});

QUnit.test("willWarn matches regex", function() {
  var restore = devUtils.willWarn(/foo/);

  dev.warn("foo bar");

  QUnit.equal(restore(), 1, "Correct number of warnings reported");
});


QUnit.test("willWarn matches multiple warnings", function() {
  var restore = devUtils.willWarn(/foo/);
  var restore2 = devUtils.willWarn("foo bar");

  dev.warn("foo bar");
  dev.warn("foo baz");

  QUnit.equal(restore(), 2, "Correct number of warnings reported for regex");
  QUnit.equal(restore2(), 1, "Correct number of warnings reported for string");
});

QUnit.test("willWarn callback fires with string and match on ALL warnings", function() {
  expect(4);
  var restore = devUtils.willWarn(/foo/, function(message, matched) {
    QUnit.ok(matched, "/foo/ regex match");
  });
  var restore2 = devUtils.willWarn("foo bar", function(message, matched) {
    QUnit.ok(message, "string match: " + matched);
  });

  dev.warn("foo bar");
  dev.warn("foo baz");

  restore();
  restore2();
});

QUnit.test("willWarn works async as well", function() {
  stop();
  var restore = devUtils.willWarn(/foo/, function(message, matched) {
    QUnit.ok(matched, "/foo/ regex match");
  });
  var restore2 = devUtils.willWarn("foo bar", function(message, matched) {
    QUnit.ok(message, "string match: " + matched);
  });

  setTimeout(function() {
    dev.warn("foo bar");
  }, 10);

  setTimeout(function() {
    restore();
    restore2();
    start();
  }, 50);
});

QUnit.test("willWarn stops counting after restore even if other warn stubs are still active", function() {
  var restore = devUtils.willWarn(/foo/);
  var restore2 = devUtils.willWarn("foo bar");

  dev.warn("foo baz");
  QUnit.equal(restore(), 1, "Correct number of warnings reported for regex");
  dev.warn("foo bar");

  QUnit.equal(restore(), 1, "Same number of warnings reported for regex");
  QUnit.equal(restore2(), 1, "Correct number of warnings reported for string");
});
