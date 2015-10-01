(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Teaspoon.Mocha.Responder = (function() {
    function Responder(runner) {
      this.specFailed = bind(this.specFailed, this);
      this.specFinished = bind(this.specFinished, this);
      this.specStarted = bind(this.specStarted, this);
      this.suiteDone = bind(this.suiteDone, this);
      this.suiteStarted = bind(this.suiteStarted, this);
      this.runnerDone = bind(this.runnerDone, this);
      this.reporter.reportRunnerStarting({
        total: runner.total
      });
      runner.on("end", this.runnerDone);
      runner.on("suite", this.suiteStarted);
      runner.on("suite end", this.suiteDone);
      runner.on("test", this.specStarted);
      runner.on("fail", this.specFailed);
      runner.on("test end", this.specFinished);
    }

    Responder.prototype.runnerDone = function() {
      return this.reporter.reportRunnerResults();
    };

    Responder.prototype.suiteStarted = function(suite) {
      return this.reporter.reportSuiteStarting(new Teaspoon.Mocha.Suite(suite));
    };

    Responder.prototype.suiteDone = function(suite) {
      return this.reporter.reportSuiteResults(new Teaspoon.Mocha.Suite(suite));
    };

    Responder.prototype.specStarted = function(spec) {
      return this.reporter.reportSpecStarting(new Teaspoon.Mocha.Spec(spec));
    };

    Responder.prototype.specFinished = function(spec) {
      spec = new Teaspoon.Mocha.Spec(spec);
      if (spec.result().status !== "failed") {
        return this.reporter.reportSpecResults(spec);
      }
    };

    Responder.prototype.specFailed = function(spec, err) {
      spec.err = err;
      return this.reporter.reportSpecResults(new Teaspoon.Mocha.Spec(spec));
    };

    return Responder;

  })();

}).call(this);
