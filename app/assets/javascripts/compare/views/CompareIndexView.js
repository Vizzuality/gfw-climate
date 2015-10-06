define([
  'backbone',
  'compare/views/index/CompareSelectorsView',
  'compare/views/index/CompareMainView',
  'compare/views/index/CompareModalView',
], function(Backbone, CompareSelectorsView, CompareMainView, CompareModalView) {

  var CompareIndexView = Backbone.View.extend({

    initialize:function() {
      new CompareSelectorsView();
      new CompareMainView();
      new CompareModalView();
    }

  });

  return CompareIndexView;

});
