define([
  'backbone',
  'compare/presenters/CompareGridPresenter',
], function(Backbone, CompareMainPresenter) {

  var CompareMainView = Backbone.View.extend({

    el: '#compareResultsView',

    initialize:function() {
      this.presenter = new CompareMainPresenter(this);
      this.status = this.presenter.status;
    },

    setListeners: function() {

    },

    render: function() {

    },



  });

  return CompareMainView;

});
