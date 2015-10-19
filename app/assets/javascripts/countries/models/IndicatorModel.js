define([
  'backbone',
  'jquery'
], function(Backbone, $) {

  var IndicatorModel = Backbone.Model.extend({

    url: '/api/indicators/',

    initialize: function() {
      this.url += '1/' + this.get('country');
    },

    parse: function(d) {
      return d.values;
    }

  });

  return IndicatorModel;

});
