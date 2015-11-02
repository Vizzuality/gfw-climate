define([
  'backbone',
  'compare/views/index/CompareSelectorsView',
  'compare/views/index/CompareGridView',
  'compare/views/index/CompareModalView',
  'compare/views/index/CompareFixedHeaderView',
], function(Backbone, CompareSelectorsView, CompareGridView, CompareModalView, CompareFixedHeaderView) {

  var CompareIndexView = Backbone.View.extend({

    initialize:function() {
      new CompareSelectorsView();
      new CompareGridView();
      new CompareModalView();
      new CompareFixedHeaderView();
    }

  });

  return CompareIndexView;

});
