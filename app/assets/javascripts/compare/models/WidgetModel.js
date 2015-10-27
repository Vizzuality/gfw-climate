define([
  'backbone'
], function(Backbone) {

  var WidgetModel = Backbone.Model.extend({

    url: '/api/widgets/',

  });

  return WidgetModel;

});
