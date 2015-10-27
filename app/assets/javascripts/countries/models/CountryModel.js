define([
  'mps',
  'backbone',
  'jquery'
], function(mps, Backbone, $) {

  var CountryModel = Backbone.Model.extend({

    url: '/api/countries/',


    initialize: function(options) {
      this.url += options.id;
    },

    parse: function(data) {
      return data.country;
    }

  });

  return CountryModel;

});
