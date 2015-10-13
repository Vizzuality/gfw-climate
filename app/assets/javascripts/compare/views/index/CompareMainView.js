define([
  'backbone',
  'compare/presenters/CompareMainPresenter',
], function(Backbone, CompareMainPresenter) {

  var CompareMainView = Backbone.View.extend({

    initialize:function() {
      this.presenter = new CompareMainPresenter(this);
    }

  });

  return CompareMainView;

});
