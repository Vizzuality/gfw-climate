(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Teaspoon.Reporters.Console = (function() {
    function Console() {
      this.reportRunnerResults = bind(this.reportRunnerResults, this);
      this.start = new Teaspoon.Date();
      this.suites = {};
    }

    Console.prototype.reportRunnerStarting = function(runner) {
      return this.log({
        type: "runner",
        total: runner.total || (typeof runner.specs === "function" ? runner.specs().length : void 0) || 0,
        start: JSON.parse(JSON.stringify(this.start))
      });
    };

    Console.prototype.reportRunnerResults = function() {
      this.log({
        type: "result",
        elapsed: ((new Teaspoon.Date().getTime() - this.start.getTime()) / 1000).toFixed(5),
        coverage: window.__coverage__
      });
      return Teaspoon.finished = true;
    };

    Console.prototype.reportSuiteStarting = function(suite) {};

    Console.prototype.reportSuiteResults = function(suite) {};

    Console.prototype.reportSpecStarting = function(spec) {};

    Console.prototype.reportSuites = function() {
      var i, index, len, ref, results, suite;
      ref = this.spec.getParents();
      results = [];
      for (index = i = 0, len = ref.length; i < len; index = ++i) {
        suite = ref[index];
        if (this.suites[suite.fullDescription]) {
          continue;
        }
        this.suites[suite.fullDescription] = true;
        results.push(this.log({
          type: "suite",
          label: suite.description,
          level: index
        }));
      }
      return results;
    };

    Console.prototype.reportSpecResults = function(spec1) {
      var result;
      this.spec = spec1;
      result = this.spec.result();
      if (result.skipped) {
        return;
      }
      this.reportSuites();
      switch (result.status) {
        case "pending":
          return this.trackPending();
        case "failed":
          return this.trackFailure();
        default:
          return this.log({
            type: "spec",
            suite: this.spec.suiteName,
            label: this.spec.description,
            status: result.status,
            skipped: result.skipped
          });
      }
    };

    Console.prototype.trackPending = function() {
      var result;
      result = this.spec.result();
      return this.log({
        type: "spec",
        suite: this.spec.suiteName,
        label: this.spec.description,
        status: result.status,
        skipped: result.skipped
      });
    };

    Console.prototype.trackFailure = function() {
      var error, i, len, ref, result, results;
      result = this.spec.result();
      ref = this.spec.errors();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        error = ref[i];
        results.push(this.log({
          type: "spec",
          suite: this.spec.suiteName,
          label: this.spec.description,
          status: result.status,
          skipped: result.skipped,
          link: this.spec.fullDescription,
          message: error.message,
          trace: error.stack || error.message || "Stack Trace Unavailable"
        }));
      }
      return results;
    };

    Console.prototype.log = function(obj) {
      if (obj == null) {
        obj = {};
      }
      obj["_teaspoon"] = true;
      return Teaspoon.log(JSON.stringify(obj));
    };

    return Console;

  })();

}).call(this);
