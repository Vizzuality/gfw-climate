define([
  'backbone'
], function(Backbone) {

  var WidgetCollection = Backbone.Collection.extend({

    url: '/api/widgets',

    parse: function(d) {
      return d.widgets;
    }

  });

  return WidgetCollection;

});
