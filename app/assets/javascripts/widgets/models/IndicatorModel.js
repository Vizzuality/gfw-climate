define([
  'backbone',
  'jquery'
], function(Backbone, $) {

  var IndicatorModel = Backbone.Model.extend({

    url: '/api/indicators/',

    // We use "1" because API hasn't got more data
    // Normally, you would use this.id
    initialize: function() {
      this.url += this.get('id') + '/' + this.get('iso');
    },

    parse: function(d) {
      return {data : d.values};
    }

  });

  return IndicatorModel;

});
