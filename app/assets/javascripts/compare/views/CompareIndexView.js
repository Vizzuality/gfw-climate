define([
  'backbone',
  'compare/views/index/CompareSelectorsView',
  'compare/views/index/CompareGridView',
  'compare/views/index/CompareModalView',
], function(Backbone, CompareSelectorsView, CompareGridView, CompareModalView) {

  var CompareIndexView = Backbone.View.extend({

    initialize:function() {
      new CompareSelectorsView();
      new CompareGridView();
      new CompareModalView();
    }

  });

  return CompareIndexView;

});
