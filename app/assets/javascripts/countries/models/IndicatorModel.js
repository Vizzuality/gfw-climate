define([
  'backbone',
  'jquery'
], function(Backbone, $) {

  var IndicatorModel = Backbone.Model.extend({

    url: '/api/indicators/',

    // We use "1" because API hasn't got more data
    // Normally, you would use this.id
    initialize: function() {
      this.url += '1/' + this.get('country');
    },

    parse: function(d) {
      return d.values;
    }

  });

  return IndicatorModel;

});
