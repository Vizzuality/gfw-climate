define([
  'backbone',
  'compare/presenters/CompareMainPresenter',
], function(Backbone, CompareMainPresenter) {

  var CompareMainView = Backbone.View.extend({

    initialize:function() {
      this.presenter = new CompareMainPresenter(this);
      this.status = this.presenter.status;
      this.setListeners();
    },

    setListeners: function() {

    },

    render: function() {

    },



  });

  return CompareMainView;

});
