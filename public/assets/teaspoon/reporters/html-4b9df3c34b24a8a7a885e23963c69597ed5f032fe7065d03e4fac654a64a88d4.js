(function() {
  Teaspoon.Reporters.BaseView = (function() {
    function BaseView() {
      this.elements = {};
      this.build();
    }

    BaseView.prototype.build = function(className) {
      return this.el = this.createEl("li", className);
    };

    BaseView.prototype.appendTo = function(el) {
      return el.appendChild(this.el);
    };

    BaseView.prototype.append = function(el) {
      return this.el.appendChild(el);
    };

    BaseView.prototype.createEl = function(type, className) {
      var el;
      if (className == null) {
        className = "";
      }
      el = document.createElement(type);
      el.className = className;
      return el;
    };

    BaseView.prototype.findEl = function(id) {
      var base;
      this.elements || (this.elements = {});
      return (base = this.elements)[id] || (base[id] = document.getElementById("teaspoon-" + id));
    };

    BaseView.prototype.setText = function(id, value) {
      var el;
      el = this.findEl(id);
      return el.innerHTML = value;
    };

    BaseView.prototype.setHtml = function(id, value, add) {
      var el;
      if (add == null) {
        add = false;
      }
      el = this.findEl(id);
      if (add) {
        return el.innerHTML += value;
      } else {
        return el.innerHTML = value;
      }
    };

    BaseView.prototype.setClass = function(id, value) {
      var el;
      el = this.findEl(id);
      return el.className = value;
    };

    BaseView.prototype.htmlSafe = function(str) {
      var el;
      el = document.createElement("div");
      el.appendChild(document.createTextNode(str));
      return el.innerHTML;
    };

    return BaseView;

  })();

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Teaspoon.Reporters.HTML = (function(superClass) {
    extend(HTML, superClass);

    function HTML() {
      this.changeSuite = bind(this.changeSuite, this);
      this.toggleConfig = bind(this.toggleConfig, this);
      this.reportRunnerResults = bind(this.reportRunnerResults, this);
      this.start = new Teaspoon.Date().getTime();
      this.config = {
        "use-catch": true,
        "build-full-report": false,
        "display-progress": true
      };
      this.total = {
        exist: 0,
        run: 0,
        passes: 0,
        failures: 0,
        skipped: 0
      };
      this.views = {
        specs: {},
        suites: {}
      };
      this.filters = [];
      this.setFilters();
      this.readConfig();
      HTML.__super__.constructor.apply(this, arguments);
    }

    HTML.prototype.build = function() {
      var ref;
      this.buildLayout();
      this.setText("env-info", this.envInfo());
      this.setText("version", Teaspoon.version);
      this.findEl("toggles").onclick = this.toggleConfig;
      this.findEl("suites").innerHTML = this.buildSuiteSelect();
      if ((ref = this.findEl("suite-select")) != null) {
        ref.onchange = this.changeSuite;
      }
      this.el = this.findEl("report-all");
      this.showConfiguration();
      this.buildProgress();
      return this.buildFilters();
    };

    HTML.prototype.reportRunnerStarting = function(runner) {
      this.total.exist = runner.total || 0;
      if (this.total.exist) {
        return this.setText("stats-duration", "...");
      }
    };

    HTML.prototype.reportRunnerResults = function() {
      if (!this.total.run) {
        return;
      }
      this.setText("stats-duration", this.elapsedTime());
      if (!this.total.failures) {
        this.setStatus("passed");
      }
      this.setText("stats-passes", this.total.passes);
      this.setText("stats-failures", this.total.failures);
      if (this.total.run < this.total.exist) {
        this.total.skipped = this.total.exist - this.total.run;
        this.total.run = this.total.exist;
      }
      this.setText("stats-skipped", this.total.skipped);
      return this.updateProgress();
    };

    HTML.prototype.reportSuiteStarting = function(suite) {};

    HTML.prototype.reportSuiteResults = function(suite) {};

    HTML.prototype.reportSpecStarting = function(spec) {
      if (this.config["build-full-report"]) {
        this.reportView = new (Teaspoon.resolveClass("Reporters.HTML.SpecView"))(spec, this);
      }
      return this.specStart = new Teaspoon.Date().getTime();
    };

    HTML.prototype.reportSpecResults = function(spec) {
      this.total.run += 1;
      this.updateProgress();
      return this.updateStatus(spec);
    };

    HTML.prototype.buildLayout = function() {
      var el;
      el = this.createEl("div");
      el.id = "teaspoon-interface";
      el.innerHTML = (Teaspoon.resolveClass("Reporters.HTML")).template();
      return document.body.appendChild(el);
    };

    HTML.prototype.buildSuiteSelect = function() {
      var filename, i, len, options, path, ref, selected, suite;
      if (Teaspoon.suites.all.length === 1) {
        return "";
      }
      filename = "";
      if (/index\.html$/.test(window.location.pathname)) {
        filename = "/index.html";
      }
      options = [];
      ref = Teaspoon.suites.all;
      for (i = 0, len = ref.length; i < len; i++) {
        suite = ref[i];
        path = [Teaspoon.root, suite].join("/");
        selected = Teaspoon.suites.active === suite ? " selected" : "";
        options.push("<option" + selected + " value=\"" + path + filename + "\">" + suite + "</option>");
      }
      return "<select id=\"teaspoon-suite-select\">" + (options.join("")) + "</select>";
    };

    HTML.prototype.buildProgress = function() {
      this.progress = Teaspoon.Reporters.HTML.ProgressView.create(this.config["display-progress"]);
      return this.progress.appendTo(this.findEl("progress"));
    };

    HTML.prototype.buildFilters = function() {
      if (this.filters.length) {
        this.setClass("filter", "teaspoon-filtered");
      }
      return this.setHtml("filter-list", "<li>" + (this.filters.join("</li><li>")), true);
    };

    HTML.prototype.elapsedTime = function() {
      return (((new Teaspoon.Date().getTime() - this.start) / 1000).toFixed(3)) + "s";
    };

    HTML.prototype.updateStat = function(name, value) {
      if (!this.config["display-progress"]) {
        return;
      }
      return this.setText("stats-" + name, value);
    };

    HTML.prototype.updateStatus = function(spec) {
      var elapsed, ref, ref1, ref2, result;
      result = spec.result();
      if (result.skipped) {
        this.updateStat("skipped", this.total.skipped += 1);
        return;
      }
      elapsed = new Teaspoon.Date().getTime() - this.specStart;
      if (result.status === "passed") {
        this.updateStat("passes", this.total.passes += 1);
        return (ref = this.reportView) != null ? ref.updateState("passed", elapsed) : void 0;
      } else if (result.status === "pending") {
        return (ref1 = this.reportView) != null ? ref1.updateState("pending", elapsed) : void 0;
      } else {
        this.updateStat("failures", this.total.failures += 1);
        if ((ref2 = this.reportView) != null) {
          ref2.updateState("failed", elapsed);
        }
        if (!this.config["build-full-report"]) {
          new (Teaspoon.resolveClass("Reporters.HTML.FailureView"))(spec).appendTo(this.findEl("report-failures"));
        }
        return this.setStatus("failed");
      }
    };

    HTML.prototype.updateProgress = function() {
      return this.progress.update(this.total.exist, this.total.run);
    };

    HTML.prototype.showConfiguration = function() {
      var key, ref, results, value;
      ref = this.config;
      results = [];
      for (key in ref) {
        value = ref[key];
        results.push(this.setClass(key, value ? "active" : ""));
      }
      return results;
    };

    HTML.prototype.setStatus = function(status) {
      return document.body.className = "teaspoon-" + status;
    };

    HTML.prototype.setFilters = function() {
      if (Teaspoon.params["file"]) {
        this.filters.push("by file: " + Teaspoon.params["file"]);
      }
      if (Teaspoon.params["grep"]) {
        return this.filters.push("by match: " + Teaspoon.params["grep"]);
      }
    };

    HTML.prototype.readConfig = function() {
      var config;
      if (config = this.store("teaspoon")) {
        return this.config = config;
      }
    };

    HTML.prototype.toggleConfig = function(e) {
      var button, name;
      button = e.target;
      if (button.tagName.toLowerCase() !== "button") {
        return;
      }
      name = button.getAttribute("id").replace(/^teaspoon-/, "");
      this.config[name] = !this.config[name];
      this.store("teaspoon", this.config);
      return Teaspoon.reload();
    };

    HTML.prototype.changeSuite = function(e) {
      var options;
      options = e.target.options;
      return window.location.href = options[options.selectedIndex].value;
    };

    HTML.prototype.store = function(name, value) {
      var ref;
      if (((ref = window.localStorage) != null ? ref.setItem : void 0) != null) {
        return this.localstore(name, value);
      } else {
        return this.cookie(name, value);
      }
    };

    HTML.prototype.cookie = function(name, value) {
      var date, match;
      if (value == null) {
        value = void 0;
      }
      if (value === void 0) {
        name = name.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");
        match = document.cookie.match(new RegExp("(?:^|;)\\s?" + name + "=(.*?)(?:;|$)", "i"));
        return match && JSON.parse(unescape(match[1]).split(" ")[0]);
      } else {
        date = new Teaspoon.Date();
        date.setDate(date.getDate() + 365);
        return document.cookie = name + "=" + (escape(JSON.stringify(value))) + "; expires=" + (date.toUTCString()) + "; path=/;";
      }
    };

    HTML.prototype.localstore = function(name, value) {
      if (value == null) {
        value = void 0;
      }
      if (value === void 0) {
        return JSON.parse(unescape(localStorage.getItem(name)));
      } else {
        return localStorage.setItem(name, escape(JSON.stringify(value)));
      }
    };

    return HTML;

  })(Teaspoon.Reporters.BaseView);

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Teaspoon.Reporters.HTML.FailureView = (function(superClass) {
    extend(FailureView, superClass);

    function FailureView(spec) {
      this.spec = spec;
      FailureView.__super__.constructor.apply(this, arguments);
    }

    FailureView.prototype.build = function() {
      var error, html, i, len, ref;
      FailureView.__super__.build.call(this, "spec");
      html = "<h1 class=\"teaspoon-clearfix\"><a href=\"" + this.spec.link + "\">" + (this.htmlSafe(this.spec.fullDescription)) + "</a></h1>";
      ref = this.spec.errors();
      for (i = 0, len = ref.length; i < len; i++) {
        error = ref[i];
        html += "<div><strong>" + (this.htmlSafe(error.message)) + "</strong><br/>" + (this.htmlSafe(error.stack || "Stack trace unavailable")) + "</div>";
      }
      return this.el.innerHTML = html;
    };

    return FailureView;

  })(Teaspoon.Reporters.BaseView);

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Teaspoon.Reporters.HTML.ProgressView = (function(superClass) {
    extend(ProgressView, superClass);

    function ProgressView() {
      return ProgressView.__super__.constructor.apply(this, arguments);
    }

    ProgressView.create = function(displayProgress) {
      if (displayProgress == null) {
        displayProgress = true;
      }
      if (!displayProgress) {
        return new Teaspoon.Reporters.HTML.ProgressView();
      }
      if (Teaspoon.Reporters.HTML.RadialProgressView.supported) {
        return new Teaspoon.Reporters.HTML.RadialProgressView();
      } else {
        return new Teaspoon.Reporters.HTML.SimpleProgressView();
      }
    };

    ProgressView.prototype.build = function() {
      return this.el = this.createEl("div", "teaspoon-indicator teaspoon-logo");
    };

    ProgressView.prototype.update = function() {};

    return ProgressView;

  })(Teaspoon.Reporters.BaseView);

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Teaspoon.Reporters.HTML.RadialProgressView = (function(superClass) {
    extend(RadialProgressView, superClass);

    function RadialProgressView() {
      return RadialProgressView.__super__.constructor.apply(this, arguments);
    }

    RadialProgressView.supported = !!document.createElement("canvas").getContext;

    RadialProgressView.prototype.build = function() {
      this.el = this.createEl("div", "teaspoon-indicator radial-progress");
      return this.el.innerHTML = "<canvas id=\"teaspoon-progress-canvas\"></canvas>\n<em id=\"teaspoon-progress-percent\">0%</em>";
    };

    RadialProgressView.prototype.appendTo = function() {
      var canvas, e;
      RadialProgressView.__super__.appendTo.apply(this, arguments);
      this.size = 80;
      try {
        canvas = this.findEl("progress-canvas");
        canvas.width = canvas.height = canvas.style.width = canvas.style.height = this.size;
        this.ctx = canvas.getContext("2d");
        this.ctx.strokeStyle = "#fff";
        return this.ctx.lineWidth = 1.5;
      } catch (_error) {
        e = _error;
      }
    };

    RadialProgressView.prototype.update = function(total, run) {
      var half, percent;
      percent = total ? Math.ceil((run * 100) / total) : 0;
      this.setHtml("progress-percent", percent + "%");
      if (!this.ctx) {
        return;
      }
      half = this.size / 2;
      this.ctx.clearRect(0, 0, this.size, this.size);
      this.ctx.beginPath();
      this.ctx.arc(half, half, half - 1, 0, Math.PI * 2 * (percent / 100), false);
      return this.ctx.stroke();
    };

    return RadialProgressView;

  })(Teaspoon.Reporters.HTML.ProgressView);

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Teaspoon.Reporters.HTML.SimpleProgressView = (function(superClass) {
    extend(SimpleProgressView, superClass);

    function SimpleProgressView() {
      return SimpleProgressView.__super__.constructor.apply(this, arguments);
    }

    SimpleProgressView.prototype.build = function() {
      this.el = this.createEl("div", "simple-progress");
      return this.el.innerHTML = "<em id=\"teaspoon-progress-percent\">0%</em>\n<span id=\"teaspoon-progress-span\" class=\"teaspoon-indicator\"></span>";
    };

    SimpleProgressView.prototype.update = function(total, run) {
      var percent;
      percent = total ? Math.ceil((run * 100) / total) : 0;
      return this.setHtml("progress-percent", percent + "%");
    };

    return SimpleProgressView;

  })(Teaspoon.Reporters.HTML.ProgressView);

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Teaspoon.Reporters.HTML.SpecView = (function(superClass) {
    var viewId;

    extend(SpecView, superClass);

    viewId = 0;

    function SpecView(spec, reporter) {
      this.spec = spec;
      this.reporter = reporter;
      this.views = this.reporter.views;
      this.spec.viewId = viewId += 1;
      this.views.specs[this.spec.viewId] = this;
      SpecView.__super__.constructor.apply(this, arguments);
    }

    SpecView.prototype.build = function() {
      var classes;
      classes = ["spec"];
      if (this.spec.pending) {
        classes.push("state-pending");
      }
      SpecView.__super__.build.call(this, classes.join(" "));
      this.el.innerHTML = "<a href=\"" + this.spec.link + "\">" + (this.htmlSafe(this.spec.description)) + "</a>";
      this.parentView = this.buildParent();
      return this.parentView.append(this.el);
    };

    SpecView.prototype.buildParent = function() {
      var parent, view;
      parent = this.spec.parent;
      if (parent.viewId) {
        return this.views.suites[parent.viewId];
      } else {
        view = new (Teaspoon.resolveClass("Reporters.HTML.SuiteView"))(parent, this.reporter);
        return this.views.suites[view.suite.viewId] = view;
      }
    };

    SpecView.prototype.buildErrors = function() {
      var div, error, html, i, len, ref;
      div = this.createEl("div");
      html = "";
      ref = this.spec.errors();
      for (i = 0, len = ref.length; i < len; i++) {
        error = ref[i];
        html += "<strong>" + (this.htmlSafe(error.message)) + "</strong><br/>" + (this.htmlSafe(error.stack || "Stack trace unavailable"));
      }
      div.innerHTML = html;
      return this.append(div);
    };

    SpecView.prototype.updateState = function(state, elapsed) {
      var base, classes, result;
      result = this.spec.result();
      classes = ["state-" + state];
      if (elapsed > Teaspoon.slow) {
        classes.push("slow");
      }
      if (state === "passed") {
        this.el.innerHTML += "<span>" + elapsed + "ms</span>";
      }
      this.el.className = classes.join(" ");
      if (result.status === "failed") {
        this.buildErrors();
      }
      return typeof (base = this.parentView).updateState === "function" ? base.updateState(state) : void 0;
    };

    return SpecView;

  })(Teaspoon.Reporters.BaseView);

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Teaspoon.Reporters.HTML.SuiteView = (function(superClass) {
    var viewId;

    extend(SuiteView, superClass);

    viewId = 0;

    function SuiteView(suite, reporter) {
      this.suite = suite;
      this.reporter = reporter;
      this.views = this.reporter.views;
      this.suite.viewId = viewId += 1;
      this.views.suites[this.suite.viewId] = this;
      this.suite = new (Teaspoon.resolveClass("Suite"))(this.suite);
      SuiteView.__super__.constructor.apply(this, arguments);
    }

    SuiteView.prototype.build = function() {
      SuiteView.__super__.build.call(this, "suite");
      this.el.innerHTML = "<h1><a href=\"" + this.suite.link + "\">" + (this.htmlSafe(this.suite.description)) + "</a></h1>";
      this.parentView = this.buildParent();
      return this.parentView.append(this.el);
    };

    SuiteView.prototype.buildParent = function() {
      var parent, view;
      parent = this.suite.parent;
      if (!parent) {
        return this.reporter;
      }
      if (parent.viewId) {
        return this.views.suites[parent.viewId];
      } else {
        view = new (Teaspoon.resolveClass("Reporters.HTML.SuiteView"))(parent, this.reporter);
        return this.views.suites[view.suite.viewId] = view;
      }
    };

    SuiteView.prototype.append = function(el) {
      if (!this.ol) {
        SuiteView.__super__.append.call(this, this.ol = this.createEl("ol"));
      }
      return this.ol.appendChild(el);
    };

    SuiteView.prototype.updateState = function(state) {
      var base;
      if (this.state === "failed") {
        return;
      }
      this.el.className = (this.el.className.replace(/\s?state-\w+/, "")) + " state-" + state;
      if (typeof (base = this.parentView).updateState === "function") {
        base.updateState(state);
      }
      return this.state = state;
    };

    return SuiteView;

  })(Teaspoon.Reporters.BaseView);

}).call(this);
(function() {
  Teaspoon.Reporters.HTML.template = function() {
    return "<div class=\"teaspoon-clearfix\">\n  <div id=\"teaspoon-title\">\n    <h1><a href=\"" + Teaspoon.root + "\" id=\"teaspoon-root-link\">Teaspoon</a></h1>\n    <ul>\n      <li>version: <b id=\"teaspoon-version\"></b></li>\n      <li id=\"teaspoon-env-info\"></li>\n    </ul>\n  </div>\n  <div id=\"teaspoon-progress\"></div>\n  <ul id=\"teaspoon-stats\">\n    <li>passes: <b id=\"teaspoon-stats-passes\">0</b></li>\n    <li>failures: <b id=\"teaspoon-stats-failures\">0</b></li>\n    <li>skipped: <b id=\"teaspoon-stats-skipped\">0</b></li>\n    <li>duration: <b id=\"teaspoon-stats-duration\">&infin;</b></li>\n  </ul>\n</div>\n\n<div id=\"teaspoon-controls\" class=\"teaspoon-clearfix\">\n  <div id=\"teaspoon-toggles\">\n    <button id=\"teaspoon-use-catch\" title=\"Toggle using try/catch wrappers when possible\">Try/Catch</button>\n    <button id=\"teaspoon-build-full-report\" title=\"Toggle building the full report\">Full Report</button>\n    <button id=\"teaspoon-display-progress\" title=\"Toggle displaying progress as tests run\">Progress</button>\n  </div>\n  <div id=\"teaspoon-suites\"></div>\n</div>\n\n<hr/>\n\n<div id=\"teaspoon-filter\">\n  <h1>Applied Filters [<a href=\"" + window.location.pathname + "\" id=\"teaspoon-filter-clear\">remove</a>]</h1>\n  <ul id=\"teaspoon-filter-list\"></ul>\n</div>\n\n<div id=\"teaspoon-report\">\n  <ol id=\"teaspoon-report-failures\"></ol>\n  <ol id=\"teaspoon-report-all\"></ol>\n</div>";
  };

}).call(this);
