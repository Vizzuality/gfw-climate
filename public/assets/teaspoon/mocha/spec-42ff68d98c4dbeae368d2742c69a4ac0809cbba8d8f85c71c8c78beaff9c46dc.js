(function() {
  Teaspoon.Mocha.Spec = (function() {
    function Spec(spec) {
      this.spec = spec;
      this.fullDescription = this.spec.fullTitle();
      this.description = this.spec.title;
      this.link = "?grep=" + (encodeURIComponent(this.fullDescription));
      this.parent = this.spec.parent;
      this.suiteName = this.parent.fullTitle();
      this.viewId = this.spec.viewId;
      this.pending = this.spec.pending;
    }

    Spec.prototype.errors = function() {
      if (!this.spec.err) {
        return [];
      }
      return [this.spec.err];
    };

    Spec.prototype.getParents = function() {
      var parent;
      if (this.parents) {
        return this.parents;
      }
      this.parents || (this.parents = []);
      parent = this.parent;
      while (parent) {
        parent = new Teaspoon.Mocha.Suite(parent);
        this.parents.unshift(parent);
        parent = parent.parent;
      }
      return this.parents;
    };

    Spec.prototype.result = function() {
      var status;
      status = "failed";
      if (this.spec.state === "passed" || this.spec.state === "skipped") {
        status = "passed";
      }
      if (this.spec.pending) {
        status = "pending";
      }
      return {
        status: status,
        skipped: this.spec.state === "skipped"
      };
    };

    return Spec;

  })();

}).call(this);
