define([
  'backbone'
], function(Backbone) {

  var WidgetModel = Backbone.Model.extend({

    url: '/api/widgets/',

    initialize: function() {
      this.url += this.get('id') + '/' + this.get('location').iso;
    },

    parse: function(data) {
      return data.widget;
    }

  });

  return WidgetModel;

});
