(function() {
  Teaspoon.Runner = (function() {
    Runner.run = false;

    function Runner() {
      if (this.constructor.run) {
        return;
      }
      this.constructor.run = true;
      this.fixturePath = Teaspoon.root + "/fixtures";
      this.params = Teaspoon.params = this.getParams();
      this.setup();
    }

    Runner.prototype.getParams = function() {
      var i, len, name, param, params, ref, ref1, value;
      params = {};
      ref = Teaspoon.location.search.substring(1).split("&");
      for (i = 0, len = ref.length; i < len; i++) {
        param = ref[i];
        ref1 = param.split("="), name = ref1[0], value = ref1[1];
        params[decodeURIComponent(name)] = decodeURIComponent(value);
      }
      return params;
    };

    Runner.prototype.getReporter = function() {
      if (this.params["reporter"]) {
        return this.findReporter(this.params["reporter"]);
      } else {
        if (window.navigator.userAgent.match(/PhantomJS/)) {
          return this.findReporter("Console");
        } else {
          return this.findReporter("HTML");
        }
      }
    };

    Runner.prototype.setup = function() {};

    Runner.prototype.findReporter = function(type) {
      return Teaspoon.resolveClass("Reporters." + type);
    };

    return Runner;

  })();

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Teaspoon.Mocha.Runner = (function(superClass) {
    extend(Runner, superClass);

    function Runner() {
      Runner.__super__.constructor.apply(this, arguments);
      window.env.run();
      window.env.started = true;
      afterEach(function() {
        return Teaspoon.Mocha.Fixture.cleanup();
      });
    }

    Runner.prototype.setup = function() {
      var reporter;
      reporter = new (this.getReporter())();
      Teaspoon.Mocha.Responder.prototype.reporter = reporter;
      return window.env.setup({
        reporter: Teaspoon.Mocha.Responder
      });
    };

    return Runner;

  })(Teaspoon.Runner);

}).call(this);
