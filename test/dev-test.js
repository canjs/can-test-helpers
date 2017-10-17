var QUnit = require("steal-qunit");
var devUtils = require("can-test-helpers/lib/dev");
var dev = require("can-log/dev/dev");
var global = require("can-util/js/global/global")();

QUnit.module("can-test-helpers/dev");

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

QUnit.test("willError stubs out dev.error until restore is called", function() {
	var _error = dev.error;

	var restore = devUtils.willError();

	QUnit.notEqual(_error, dev.error, "error function stubbed");

	restore();

	QUnit.equal(_error, dev.error, "error function unstubbed");
});

QUnit.test("willError returns restore function", function() {
	var restore = devUtils.willError();

	QUnit.equal(typeof restore, "function", "function returned");

	restore();
});

QUnit.test("willError restore function gives zero result if no errors.", function() {
	var restore = devUtils.willError();

	QUnit.equal(restore(), 0, "Zero incidents counted");
});

QUnit.test("willError matches strings", function() {
	var restore = devUtils.willError("foo");

	dev.error("foo");

	QUnit.equal(restore(), 1, "Correct number of errors reported");
});

QUnit.test("willError matches regex", function() {
	var restore = devUtils.willError(/foo/);

	dev.error("foo bar");

	QUnit.equal(restore(), 1, "Correct number of errors reported");
});

QUnit.test("willError matches error message for Error object", function() {
	var restore = devUtils.willError("foo");

	dev.error(new Error("foo"));

	QUnit.equal(restore(), 1, "Correct number of errors reported");
});


QUnit.test("willError matches multiple errors", function() {
	var restore = devUtils.willError(/foo/);
	var restore2 = devUtils.willError("foo bar");

	dev.error("foo bar");
	dev.error("foo baz");

	QUnit.equal(restore(), 2, "Correct number of errors reported for regex");
	QUnit.equal(restore2(), 1, "Correct number of errors reported for string");
});

QUnit.test("willError callback fires with string and match on ALL errors", function() {
	expect(4);
	var restore = devUtils.willError(/foo/, function(message, matched) {
		QUnit.ok(matched, "/foo/ regex match");
	});
	var restore2 = devUtils.willError("foo bar", function(message, matched) {
		QUnit.ok(message, "string match: " + matched);
	});

	dev.error("foo bar");
	dev.error("foo baz");

	restore();
	restore2();
});

QUnit.test("willError works async as well", function() {
	stop();
	var restore = devUtils.willError(/foo/, function(message, matched) {
		QUnit.ok(matched, "/foo/ regex match");
	});
	var restore2 = devUtils.willError("foo bar", function(message, matched) {
		QUnit.ok(message, "string match: " + matched);
	});

	setTimeout(function() {
		dev.error("foo bar");
	}, 10);

	setTimeout(function() {
		restore();
		restore2();
		start();
	}, 50);
});

QUnit.test("willError stops counting after restore even if other error stubs are still active", function() {
	var restore = devUtils.willError(/foo/);
	var restore2 = devUtils.willError("foo bar");

	dev.error("foo baz");
	QUnit.equal(restore(), 1, "Correct number of errors reported for regex");
	dev.error("foo bar");

	QUnit.equal(restore(), 1, "Same number of errors reported for regex");
	QUnit.equal(restore2(), 1, "Correct number of errors reported for string");
});


QUnit.test("willError and willWarn don't count each other's logging", function() {
	var restore = devUtils.willError(/foo/);
	var restore2 = devUtils.willWarn(/bar/);

	dev.error("foo bar baz");
	dev.warn("foo bar");
	dev.warn("foo bar quux");

	QUnit.equal(restore(), 1, "Correct number of errors reported");
	QUnit.equal(restore2(), 2, "Correct number of warnings reported");
});


QUnit.test("devOnlyTest calls test() only when the environment is not production", function() {
	var oldEnv = System.env;
	var oldTest = global.test;
	expect(1);

	System.env = "window-development";
	global.test = function(name) {
		QUnit.equal(name, "foo", "development test function called");
	};

	devUtils.devOnlyTest("foo");

	System.env = "window-production";

	devUtils.devOnlyTest("foo");

	System.env = oldEnv;
	global.test = oldTest;
});