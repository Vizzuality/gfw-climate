define([
  'backbone',
  'compare/views/index/CompareSelectorsView',
  'compare/views/index/CompareGridView',
  'compare/views/index/CompareModalView',
  'compare/views/index/CompareFixedHeaderView',
  'compare/views/index/CompareGridButtonBoxView',
], function(Backbone, CompareSelectorsView, CompareGridView, CompareModalView, CompareFixedHeaderView, CompareGridButtonBoxView) {

  var CompareIndexView = Backbone.View.extend({

    initialize:function() {
      new CompareSelectorsView();
      new CompareGridView();
      new CompareModalView();
      new CompareFixedHeaderView();
      new CompareGridButtonBoxView();
    }

  });

  return CompareIndexView;

});
