(function() {
  Teaspoon.Mocha.Suite = (function() {
    function Suite(suite) {
      var ref;
      this.suite = suite;
      this.fullDescription = this.suite.fullTitle();
      this.description = this.suite.title;
      this.link = "?grep=" + (encodeURIComponent(this.fullDescription));
      this.parent = ((ref = this.suite.parent) != null ? ref.root : void 0) ? null : this.suite.parent;
      this.viewId = this.suite.viewId;
    }

    return Suite;

  })();

}).call(this);
