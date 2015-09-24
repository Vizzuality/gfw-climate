define([
  'backbone',
  'compare/views/index/CompareSelectorsView'
], function(Backbone, CompareSelectorsView) {

  var CompareIndexView = Backbone.View.extend({

    initialize:function() {
      new CompareSelectorsView();
    }

  });

  return CompareIndexView;

});
