define([
  'backbone',
  'compare/views/index/CompareSelectorsView',
  'compare/views/index/CompareMainView'
], function(Backbone, CompareSelectorsView, CompareMainView) {

  var CompareIndexView = Backbone.View.extend({

    initialize:function() {
      new CompareSelectorsView();
      new CompareMainView();
    }

  });

  return CompareIndexView;

});
